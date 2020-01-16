import { Test } from '@nestjs/testing';
import { ModuleWithDecoratorsTest } from './app/decorator/module';
import { ConsoleModule } from '../module';
import { ConsoleScanner } from '../scanner';
import { ModuleTest } from './app/module';
import { CliWithDecorator } from './app/decorator/cli';
import { DynamicModuleTest } from './app/module.dynamic';

function testScanCliDecorator(value: any) {
    expect(value.instance).toBeInstanceOf(CliWithDecorator);
    expect(value.methods).toHaveLength(4);

    expect(value.methods[0]).toHaveProperty('name');
    expect(value.methods[0].name).toBe('command');
    expect(value.methods[0]).toHaveProperty('metadata');
    expect(value.methods[0].metadata).toHaveProperty('command');
    expect(value.methods[0].metadata.command).toBe('command <myArgument>');
    expect(value.methods[0].metadata.alias).toBe('c');
    expect(value.methods[0].metadata.description).toBe('description');

    expect(value.methods[2]).toHaveProperty('name');
    expect(value.methods[2].name).toBe('commandWithError');
    expect(value.methods[2]).toHaveProperty('metadata');
    expect(value.methods[2].metadata).toHaveProperty('command');
    expect(value.methods[2].metadata.command).toBe(
        'commandWithError <myArgument>'
    );
    expect(value.methods[2].metadata.alias).toBe('cErr');
    expect(value.methods[2].metadata.description).toBe('description');
}

describe('Scanner', () => {
    it('Should scan a nest application and returns empty response', async () => {
        const mod = await Test.createTestingModule({
            imports: [ConsoleModule]
        }).compile();

        const scanner = new ConsoleScanner();
        const scanResponse = scanner.scan(mod, [ModuleTest]);

        expect(scanResponse).toBeInstanceOf(Set);
        expect(scanResponse.size).toBe(0);
    });

    it('Should scan a nest application and find an instance with decorated methods', async () => {
        const mod = await Test.createTestingModule({
            imports: [ModuleWithDecoratorsTest]
        }).compile();

        const scanner = new ConsoleScanner();
        const scanResponse = scanner.scan(mod, [ModuleWithDecoratorsTest]);

        expect(scanResponse).toBeInstanceOf(Set);

        const { value } = scanResponse.values().next();
        testScanCliDecorator(value);
    });

    it('Should scan a nest application from a dynamic module and find an instance with decorated methods', async () => {
        const mod = await Test.createTestingModule({
            imports: [DynamicModuleTest.register()]
        }).compile();

        const scanner = new ConsoleScanner();
        const scanResponse = scanner.scan(mod, [ModuleWithDecoratorsTest]);

        expect(scanResponse).toBeInstanceOf(Set);

        const { value } = scanResponse.values().next();
        testScanCliDecorator(value);
    });
});
