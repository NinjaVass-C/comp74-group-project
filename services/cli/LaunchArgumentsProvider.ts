import { Command, type OptionValues } from "commander";
import type { ILaunchArgumentsProvider } from "./ILaunchArgumentsProvider";

export class LaunchArgumentsProvider implements ILaunchArgumentsProvider {
    private arguments: OptionValues = {};

    initLaunchArguments(args: string[]): void {
        const program = new Command();

        program
            .name("COMP74 API")
            .option("-p, --port <number>", "Port to run the webserver on", process.env.WEBSERVER_PORT || "3000")
            .parse(args);

        this.arguments = program.opts();
    }

    getArgument<T>(key: string): T | undefined {
        return this.arguments[key] as T | undefined;
    }

}