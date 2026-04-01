import { token, Container } from "brandi";
import type { ILoggingService } from "./logging/ILoggingService";
import type { IWebserverService } from "./webserver/IWebserverService";
import type { IConsoleService } from "./cli/IConsoleService";
import { GlobalLoggingService } from "./logging/GlobalLoggingService";
import { ConsoleLoggingStrategy } from "./logging/strategies/ConsoleLoggingStrategy";
import { FileLoggingStrategy } from "./logging/strategies/FileLoggingStrategy";
import { ConsoleService } from "./cli/ConsoleService";
import { LogSeverity } from "../models/logging/LogSeverity";
import type { WebserverEndpoint } from "../endpoints/WebserverEndpoint";
import { BunWebserverService } from "./webserver/BunWebserverService";
import type { ILaunchArgumentsProvider } from "./cli/ILaunchArgumentsProvider";
import { LaunchArgumentsProvider } from "./cli/LaunchArgumentsProvider";
import type { IDatabaseService } from "./db/IDatabaseService";
import { DrizzleDatabaseService } from "./db/drizzle/DrizzleDatabaseService";

/**
 * DI tokens for the application's services. These are used to register and retrieve services from the DI container.
 */
export const DI_TOKENS = {
    logger: token<ILoggingService>("logger"),
    console: token<IConsoleService>("console"),
    webserver: token<IWebserverService>("webserver"),
    launchArgs: token<ILaunchArgumentsProvider>("launchArgs"),
    database: token<IDatabaseService>("database")
}

/**
 * Initializes the dependency injection container with the application's services and their dependencies. 
 * This function is called at the start of the application to set up all necessary services before they are used.
 * 
 * @param {WebserverEndpoint[]} endpoints - An array of webserver endpoints to be registered with the webserver service.
 * @returns {Container} The initialized DI container with all services registered.
 */
export function bootstrap(endpoints: WebserverEndpoint[]): Container {
    const dependencies = new Container();

    /** Launch Arguments */
    const launchArgumentsService = new LaunchArgumentsProvider();
    launchArgumentsService.initLaunchArguments(Bun.argv);
    dependencies.bind(DI_TOKENS.launchArgs).toConstant(launchArgumentsService);

    /** Logging */
    const loggingService = new GlobalLoggingService([
        new ConsoleLoggingStrategy(),
        new FileLoggingStrategy("latest.log")
    ]);
    dependencies.bind(DI_TOKENS.logger).toConstant(loggingService);

    /** Console I/O */
    const console: IConsoleService = new ConsoleService({
        quit(this: ConsoleService, args: string[]) {
            this.logger.log("Shutting down application...", LogSeverity.INFO);
            process.exit(0);
        }
    }, dependencies);

    dependencies.bind(DI_TOKENS.console).toConstant(console);

    /** Webserver */
    const webserver = new BunWebserverService(dependencies, endpoints);
    dependencies.bind(DI_TOKENS.webserver).toConstant(webserver);

    /** Database */
    const database = new DrizzleDatabaseService();
    dependencies.bind(DI_TOKENS.database).toConstant(database);

    return dependencies;
}