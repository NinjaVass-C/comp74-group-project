import { Command } from "commander";
import { LogSeverity } from "./models/logging/LogSeverity";
import { bootstrap, TOKENS } from "./services/bootstrap";
import { ENDPOINTS } from "./models/endpoints";

function app(args: string[]) {
    const program = new Command();

    program
        .name("COMP74 API")
        .option("-p, --port <number>", "Port to run the webserver on", process.env.WEBSERVER_PORT || "3000")
        .parse(args);

    const options = program.opts();
    const port = parseInt(options.port, 10);

    const app = bootstrap(ENDPOINTS);

    const loggingService = app.get(TOKENS.logger);
    const webserver = app.get(TOKENS.webserver);
    const console = app.get(TOKENS.console);

    console.start();
    loggingService.log("COMP74 Bun API by Julian Seitz, Connor Vass, and Ben Wartman initialized successfully!", LogSeverity.INFO);
    webserver.start(port);
}

app(Bun.argv);