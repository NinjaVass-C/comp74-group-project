import { bootstrap, DI_TOKENS } from "./services/bootstrap";
import { ENDPOINTS } from "./models/endpoints";

/**
 * Main entry point for the application. Initializes DI container, sets up services, and starts the webserver and console interface.
 * 
 * @param {string[]} args - Command-line arguments passed to the application. 
 */
function app() {
    const app = bootstrap(ENDPOINTS);

    const args = app.get(DI_TOKENS.launchArgs);
    const webserver = app.get(DI_TOKENS.webserver);
    const console = app.get(DI_TOKENS.console);
    console.start();

    let port: number = Number.parseInt(process.env.WEBSERVER_PORT!) ?? 3000;
    const portArg = args.getArgument<number>("port");
    if (portArg) {
        port = portArg;
    }
    webserver.start(port);
}

app();