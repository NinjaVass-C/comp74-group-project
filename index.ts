import { Command } from "commander";
import { LogSeverity } from "./models/logging/LogSeverity";
import { bootstrap, TOKENS } from "./services/bootstrap";
import { ENDPOINTS } from "./models/endpoints";

/**
 * Main entry point for the application. Initializes DI container, sets up services, and starts the webserver and console interface.
 * 
 * @param {string[]} args - Command-line arguments passed to the application. 
 */
function app() {
    const app = bootstrap(ENDPOINTS);

    const args = app.get(TOKENS.launchArgs);
    const loggingService = app.get(TOKENS.logger);
    const webserver = app.get(TOKENS.webserver);
    const console = app.get(TOKENS.console);

    console.start();
    loggingService.log("COMP74 Bun API by Julian Seitz, Connor Vass, and Ben Wartman initialized successfully!", LogSeverity.INFO);

    let port: number = Number.parseInt(process.env.WEBSERVER_PORT!) ?? 3000;
    const portArg = args.getArgument<number>("port");
    if (portArg) {
        port = portArg;
    }

    webserver.start(port);
}

app();