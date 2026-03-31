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

export const TOKENS = {
    logger: token<ILoggingService>("logger"),
    console: token<IConsoleService>("console"),
    webserver: token<IWebserverService>("webserver"),
    launchArgs: token<ILaunchArgumentsProvider>("launchArgs")
}

export function bootstrap(endpoints: WebserverEndpoint[]): Container {
    const dependencies = new Container();

    const launchArgumentsService = new LaunchArgumentsProvider();
    launchArgumentsService.initLaunchArguments(Bun.argv);
    dependencies.bind(TOKENS.launchArgs).toConstant(launchArgumentsService);

    const loggingService = new GlobalLoggingService([
        new ConsoleLoggingStrategy(),
        new FileLoggingStrategy("latest.log")
    ]);
    dependencies.bind(TOKENS.logger).toConstant(loggingService);

    const console: IConsoleService = new ConsoleService({
        quit(this: ConsoleService, args: string[]) {
            this.logger.log("Shutting down application...", LogSeverity.INFO);
            process.exit(0);
        }
    }, dependencies);

    dependencies.bind(TOKENS.console).toConstant(console);
    
    const webserver = new BunWebserverService(dependencies, endpoints);
    dependencies.bind(TOKENS.webserver).toConstant(webserver);

    return dependencies;
}