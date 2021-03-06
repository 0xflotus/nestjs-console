// tslint:disable:no-console
import { Command, Console } from '../../../decorators';

@Console({
    name: 'groupCommand',
    alias: 'gc',
    description: 'description'
})
export class CliWithNamedDecorator {
    @Command({
        command: 'subCommand1 <myArgument>',
        alias: 'sub1',
        description: 'description',
        options: [
            {
                flags: '-o, --optional [value]'
            }
        ]
    })
    public subCommand1(myArgument: string, options: any) {
        console.log(myArgument);
        if (options.optional) {
            console.log(options.optional);
        }
        return myArgument;
    }

    @Command({
        command: 'asyncSubCommand1 <myArgument>',
        alias: 'acSub1',
        description: 'description'
    })
    async asyncSubCommand1(myArgument: string) {
        // wait 1 second simulating async task
        return new Promise((ok, fail) => {
            setTimeout(() => {
                console.log(myArgument);
                ok(myArgument);
            }, 0);
        });
    }

    @Command({
        command: 'subCommandWithError <myArgument>',
        alias: 'subErr',
        description: 'description'
    })
    subCommandWithError(myArgument: string) {
        throw new Error(myArgument);
    }

    @Command({
        command: 'asyncSubCommandWithError <myArgument>',
        alias: 'acSubErr',
        description: 'description'
    })
    async asyncSubCommandWithError(myArgument: string) {
        // wait 1 second simulating async task
        await new Promise((ok, fail) =>
            setTimeout(() => {
                fail(new Error(myArgument));
            }, 1000)
        );
    }

    @Command({
        command: 'subCommandWithNoArg',
        alias: 'subNoArg',
        description: 'description'
    })
    subCommandWithNoArg() {
        console.log('subCommandWithNoArg executed');
    }

    @Command({
        command: 'asyncSubCommandWithNoArg',
        alias: 'acSubNoArg',
        description: 'description'
    })
    async asyncSubCommandWithNoArg() {
        // wait 1 second simulating async task
        await new Promise((ok, fail) =>
            setTimeout(() => {
                ok();
            }, 3000)
        );
        console.log('asyncSubCommandWithNoArg executed');
    }
}
