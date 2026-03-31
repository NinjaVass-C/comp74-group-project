import type { Container } from "brandi";
import { LogSeverity } from "../../models/logging/LogSeverity";
import type { ILoggingService } from "../logging/ILoggingService";
import { FileLoggingStrategy } from "../logging/strategies/FileLoggingStrategy";
import type { IConsoleService } from "./IConsoleService";
import { TOKENS } from "../bootstrap";
import readline from 'node:readline';

export class ConsoleService implements IConsoleService {
    private commandRegistry: Map<string, (args: string[]) => void>;
    public logger: ILoggingService;
    private container: Container;

    constructor(commands: { [key: string]: (this: ConsoleService, args: string[]) => void }, container: Container) {
        this.commandRegistry = new Map();
        this.container = container;
        this.logger = container.get(TOKENS.logger);

        for (const [key, command] of Object.entries(commands)) {
            this.commandRegistry.set(key, command.bind(this));
        }
    }

    start() {
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