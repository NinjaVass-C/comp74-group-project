import { token, Container, type Token, createContainer, injected } from "brandi";
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
import type { ILoggingStrategy } from "./logging/ILoggingStrategy";
import type { ICommand } from "../models/console/commands/ICommand";
import QuitCommand from "../models/console/commands/QuitCommand";

/**
 * DI tokens for the application's services. These are used to register and retrieve services from the DI container.
 */
export const DI_TOKENS = {
    logger: token<ILoggingService>("logger"),
    console: token<IConsoleService>("console"),
    webserver: token<IWebserverService>("webserver"),
    launchArgs: token<ILaunchArgumentsProvider>("launchArgs"),
    database: token<IDatabaseService>("database"),
    endpoints: token<WebserverEndpoint[]>("endpoints"),
    logStrategies: token<ILoggingStrategy[]>("logStrategies"),
    commands: token<ICommand[]>("commands")
}

/**
 * Initializes the dependency injection container with the application's services and their dependencies. 
 * This function is called at the start of the application to set up all necessary services before they are used.
 * 
 * @param {WebserverEndpoint[]} endpoints - An array of webserver endpoints to be registered with the webserver service.
 * @returns {Container} The initialized DI container with all services registered.
 */
export function bootstrap(endpoints: WebserverEndpoint[]): Container {
    const container = createContainer();

    /** Launch Arguments */
    const launchArgumentsService = new LaunchArgumentsProvider();
    launchArgumentsService.initLaunchArguments(Bun.argv);
    container.bind(DI_TOKENS.launchArgs).toConstant(launchArgumentsService);

    const logStrategies: ILoggingStrategy[] = [
        new ConsoleLoggingStrategy(), new FileLoggingStrategy("latest.log")
    ];

    bindMany(container, new Map<typeof DI_TOKENS[keyof typeof DI_TOKENS], any>([
        [DI_TOKENS.logger, GlobalLoggingService],
        [DI_TOKENS.console, ConsoleService],
        [DI_TOKENS.webserver, BunWebserverService],
        [DI_TOKENS.database, DrizzleDatabaseService],
        [DI_TOKENS.endpoints, endpoints],
        [DI_TOKENS.logStrategies, logStrategies],
        [DI_TOKENS.commands, [
            new QuitCommand()
        ]]
    ]));

    injectMany(new Map<any, any[]>([
        [GlobalLoggingService, [DI_TOKENS.logStrategies]],
        [ConsoleService, [DI_TOKENS.commands, DI_TOKENS.logger]],
        [BunWebserverService, [DI_TOKENS.endpoints, DI_TOKENS.logger]],
        [DrizzleDatabaseService, []]
    ]));

    endpoints.forEach(endpoint => {
        try {
            endpoint.injectDependencies(container);
        } catch (error) {
            console.error(`Error injecting dependencies into endpoint ${endpoint.constructor.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    return container;
}

function bindMany(container: Container, tokenMap: Map<typeof DI_TOKENS[keyof typeof DI_TOKENS], any>): void {
    for (const [token, instance] of tokenMap) {
        try {
            if (instance instanceof Array) {
                container.bind(token).toConstant(instance);
                continue;
            }

            container.bind(token).toInstance(instance).inSingletonScope();
        } catch (error) {
            console.error(`Error binding token ${String(token)}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

function injectMany(injectionMap: Map<any, any[]>): void {
    for (const [target, dependencies] of injectionMap) {
        try {
            injected(target, ...dependencies);
        } catch (error) {
            console.error(`Error injecting dependencies into ${target.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}