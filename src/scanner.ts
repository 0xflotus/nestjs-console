import { INestApplicationContext } from '@nestjs/common';
import { isEmpty } from 'lodash';

import { COMMAND_METADATA_NAME, CONSOLE_METADATA_NAME } from './constants';
import { IConsoleOptions, ICreateCommandOptions } from './decorators';

/**
 * The interface for command method metadata
 */
export interface IMethodsMetadata {
    name: string;
    metadata: ICreateCommandOptions;
}

/**
 * The response of the scanner
 */
export interface IScanResponse {
    instance: any;
    metadata: IConsoleOptions;
    methods: IMethodsMetadata[];
}

export class ConsoleScanner {
    /**
     * Get all the modules
     */
    private getModules(modulesContainer: Map<any, any>, include: any[]): any[] {
        const allModules = [...modulesContainer.values()];
        if (!include || isEmpty(include)) {
            return allModules;
        }
        return allModules.filter(({ metatype }) =>
            include.some(item => item === metatype)
        );
    }

    /**
     * Get a list of classes methods
     */
    private getInstanceMethods(instance: any): string[] {
        return Object.getOwnPropertyNames(instance)
            .concat(Object.getOwnPropertyNames(instance.__proto__))
            .filter(m =>
                Reflect.hasMetadata(COMMAND_METADATA_NAME, instance, m)
            );
    }

    /**
     * Scan an application
     * @param app
     * @param includedModules
     */
    public scan(
        app: INestApplicationContext,
        includedModules?: any[]
    ): Set<IScanResponse> {
        const set = new Set<IScanResponse>();
        const { container } = app as any;
        const modules = this.getModules(
            container.getModules(),
            includedModules
        );
        modules.forEach(m => {
            m._providers.forEach(p => {
                const { metatype, name } = p;
                if (typeof metatype !== 'function') {
                    return;
                }

                // ignore providers without instance
                if (!p.instance) {
                    return;
                }

                const consoleMetadata: IConsoleOptions = Reflect.getMetadata(
                    CONSOLE_METADATA_NAME,
                    p.instance.constructor
                );

                // ignore providers without the console decorator
                if (!consoleMetadata) {
                    return;
                }

                // get the provider instance from the container
                const instance = app.get(name);
                const methods = this.getInstanceMethods(instance);

                // get the metadata of the methods
                const methodsMetadata = methods.map<IMethodsMetadata>(
                    methodMetadata => ({
                        name: methodMetadata,
                        metadata: Reflect.getMetadata(
                            COMMAND_METADATA_NAME,
                            instance,
                            methodMetadata
                        )
                    })
                );

                set.add({
                    instance,
                    metadata: consoleMetadata,
                    methods: methodsMetadata
                });
            });
        });

        return set;
    }
}
