import { Command, type OptionValues } from "commander";
import type { ILaunchArgumentsProvider } from "./ILaunchArgumentsProvider";

/**
 * Implements the ILaunchArgumentsProvider interface to provide a concrete implementation for parsing and retrieving command-line arguments using the commander library.
 */
export class LaunchArgumentsProvider implements ILaunchArgumentsProvider {
    private arguments: OptionValues = {};

    /**
     * Initialized launch arguments by parsing the provided command-line arguments using the commander library. The parsed arguments are stored in the `arguments` property for later retrieval.
     * @param {string[]} args 
     */
    public initLaunchArguments(args: string[]): void {
        const program = new Command();

        program
            .name("COMP74 API")
            .option("-p, --port <number>", "Port to run the webserver on", process.env.WEBSERVER_PORT || "3000")
            .parse(args);

        this.arguments = program.opts();
    }

    /**
     * Grabs a specific argument by its key from the parsed arguments. The method is generic, allowing the caller to specify the expected type of the argument value. If the key does not exist in the parsed arguments, it returns undefined.
     * @param {string} key - The key of the argument to retrieve, i.e "port".
     * @returns {T | undefined} The value of the argument if it exists, or undefined if it does not.
     */
    public getArgument<T>(key: string): T | undefined {
        return this.arguments[key] as T | undefined;
    }

}