import { IndexEndpoint } from "./endpoints/IndexEndpoint";
import { LogSeverity } from "./models/logging/LogSeverity";
import { ConsoleService } from "./services/cli/ConsoleService";
import type { IConsoleService } from "./services/cli/IConsoleService";
import { GlobalLoggingService } from "./services/logging/GlobalLoggingService";
import type { ILoggingService } from "./services/logging/ILoggingService";
import { ConsoleLoggingStrategy } from './services/logging/strategies/ConsoleLoggingStrategy';
import { FileLoggingStrategy } from "./services/logging/strategies/FileLoggingStrategy";
import { BunWebserverService } from "./services/webserver/BunWebserverService";
import readline from "node:readline";

function main(args: string[]) {
    const loggingService: ILoggingService = new GlobalLoggingService([
        new ConsoleLoggingStrategy(),
        new FileLoggingStrategy("output.log")
    ]);

    const console: IConsoleService = new ConsoleService({
        quit: () => {
            loggingService.log("Shutting down application...", LogSeverity.INFO);
            process.exit(0);
        }
    }, loggingService);

    const webserver = new BunWebserverService(loggingService, [
        new IndexEndpoint()
    ]);

    loggingService.log("COMP74 Bun API by Julian Seitz, Connor Vass, and Ben Wartman initialized successfully!", LogSeverity.INFO);
    webserver.start(3000);

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
            console.handle(command);
        }
        rl.prompt();
    }).on("close", () => {
        process.exit(0);
    });
}

main(Bun.argv);