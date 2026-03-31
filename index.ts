import { IndexEndpoint } from "./endpoints/IndexEndpoint";
import { LogSeverity } from "./models/logging/LogSeverity";
import { ConsoleService } from "./services/cli/ConsoleService";
import type { IConsoleService } from "./services/cli/IConsoleService";
import { GlobalLoggingService } from "./services/logging/GlobalLoggingService";
import type { ILoggingService } from "./services/logging/ILoggingService";
import { ConsoleLoggingStrategy } from './services/logging/strategies/ConsoleLoggingStrategy';
import { FileLoggingStrategy } from "./services/logging/strategies/FileLoggingStrategy";
import { BunWebserverService } from "./services/webserver/BunWebserverService";

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

    process.stdin.setEncoding("utf8");
    process.stdin.resume();

    let inputBuffer = "";
    process.stdout.write("> ");

    process.stdin.on("data", (chunk: string) => {
        inputBuffer += chunk;

        let newlineIndex = inputBuffer.indexOf("\n");
        while (newlineIndex !== -1) {
            const line = inputBuffer.slice(0, newlineIndex).replace(/\r$/, "");
            inputBuffer = inputBuffer.slice(newlineIndex + 1);

            if (line.trim().length > 0) {
                console.handle(line);
            }

            process.stdout.write("> ");
            newlineIndex = inputBuffer.indexOf("\n");
        }
    });
}

main(Bun.argv);