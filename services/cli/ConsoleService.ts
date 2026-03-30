import { LogSeverity } from "../../models/logging/LogSeverity";
import type { ILoggingService } from "../logging/ILoggingService";
import { FileLoggingStrategy } from "../logging/strategies/FileLoggingStrategy";
import type { IConsoleService } from "./IConsoleService";

export class ConsoleService implements IConsoleService {
    private commandRegistry: Map<string, (args: string[]) => void>;
    private logger: ILoggingService;

    constructor(commands: { [key: string]: (args: string[]) => void }, logger: ILoggingService) {
        this.commandRegistry = new Map(Object.entries(commands));
        this.logger = logger;
    }

    handle(input: string): void {
        const [command, ...args] = input.trim().split(/\s+/);
        
        if(!command){
            this.logger.log("No command entered.", LogSeverity.WARNING);
            return;
        }

        const commandFunc = this.commandRegistry.get(command);
        if (commandFunc) {
            try {
                commandFunc(args);
                this.logger.logTo(`Executed command: ${command} with args: ${args.join(" ")}`, LogSeverity.INFO, FileLoggingStrategy);
            } catch (error) {
                this.logger.logTo(`Error executing command: ${command} - ${error instanceof Error ? error.message : String(error)}`, LogSeverity.ERROR, FileLoggingStrategy);
            }
        } else {
            this.logger.log(`Unknown command: ${command}`, LogSeverity.WARNING);
        }
    }
}