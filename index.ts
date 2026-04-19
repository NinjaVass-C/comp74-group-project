import { bootstrap, DI_TOKENS } from "./services/bootstrap";
import { ENDPOINTS } from "./models/endpoints";
import type { Container } from "brandi";
import { LogSeverity } from "./models/logging/LogSeverity";
import { importAllEndpoints } from "./services/imports";
import { generateOpenApi } from "./docs/openapi";

/**
 * Main entry point for the application. 
 * 
 * Initializes DI container, sets up services, and starts the webserver and console interface. 
 */
function app() {
    importAllEndpoints().then(() => {
        const app = bootstrap(Array.from(ENDPOINTS));

        const webserver = app.get(DI_TOKENS.webserver);
        const console = app.get(DI_TOKENS.console);
        console.start();

        const port = getPort(app);
        webserver.start(port);
    });
}

/**
 * Gets the configured port which is either:
 * 
 * 1) specified via the "port" command-line argument
 * 2) set in the environment variable WEBSERVER_PORT
 * 3) defaults to 3000 if neither of the above are provided or valid
 * 
 * @param app - The dependency injection container which can be used to retrieve services.
 * @returns The port number to start the webserver on.
 */
function getPort(app: Container): number {
    const args = app.get(DI_TOKENS.launchArgs);

    let port: number = Number.parseInt(process.env.WEBSERVER_PORT!) ?? 3000;
    const portArg = args.getArgument<number>("port");
    if (portArg) {
        port = portArg;
    }

    if (isNaN(port) || port <= 0 || port > 65535) {
        const logger = app.get(DI_TOKENS.logger);
        logger.log(`Invalid port number provided: ${port}. Falling back to default port 3000.`, LogSeverity.WARNING);
        port = 3000;
    }

    return port;
}

app();