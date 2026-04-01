import type { ICommand } from "../../models/console/commands/ICommand";
import { LogSeverity, type LogSeverityType } from "../../models/logging/LogSeverity";
import type { ILoggingService } from "../logging/ILoggingService";
import { FileLoggingStrategy } from "../logging/strategies/FileLoggingStrategy";
import type { IConsoleService } from "./IConsoleService";
import readline from 'node:readline';

export class ConsoleService implements IConsoleService {
    constructor(private commandRegistry: ICommand[], protected logger: ILoggingService) { }
    
    log(message: string, severity?: LogSeverityType): void {
        this.logger.log(message, severity);
    }

    start() {
        this.logger.log("COMP74 Web API (Julian Seitz, Connor Vass, and Ben Wartman) - CLI Initialized successfully!", LogSeverity.INFO);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true,
            prompt: "> "
        });

        rl.prompt();

        rl.on("line", (line) => {
            const command = line.trim();
            if (command) {
                this.handle(command);
            }
            rl.prompt();
        }).on("close", () => {
            process.exit(0);
        });
    }

    handle(input: string): void {
        const [command, ...args] = input.trim().split(/\s+/);

        if (!command) {
            this.logger.log("No command entered.", LogSeverity.WARNING);
            return;
        }

        const commandFunc = this.commandRegistry.find((cmd) => cmd.name === command);
        if (commandFunc) {
            try {
                commandFunc.execute(this, args);
                this.logger.logTo(`Executed command: ${command} with args: ${args.join(" ")}`, LogSeverity.INFO, FileLoggingStrategy);
            } catch (error) {
                this.logger.logTo(`Error executing command: ${command} - ${error instanceof Error ? error.message : String(error)}`, LogSeverity.ERROR, FileLoggingStrategy);
            }
        } else {
            this.logger.log(`Unknown command: ${command}`, LogSeverity.WARNING);
        }
    }
}