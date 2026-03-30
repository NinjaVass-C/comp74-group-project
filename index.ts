import { LogSeverity } from "./models/logging/LogSeverity";
import { ConsoleService } from "./services/cli/ConsoleService";
import type { IConsoleService } from "./services/cli/IConsoleService";
import { GlobalLoggingService } from "./services/logging/GlobalLoggingService";
import type { ILoggingService } from "./services/logging/ILoggingService";
import { ConsoleLoggingStrategy } from './services/logging/strategies/ConsoleLoggingStrategy';
import { FileLoggingStrategy } from "./services/logging/strategies/FileLoggingStrategy";

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

    loggingService.log("COMP74 Bun API by Julian Seitz, Connor Vass, and Ben Wartman initialized successfully!", LogSeverity.INFO);
    const running = true;

    while(running){
        // read next line of input if any
        const input = prompt(">");
        if(input !== null){
            console.handle(input);  
        }
    }
}

main(Bun.argv);