import type { BunRequest } from "bun";
import type { IWebserverService } from "./IWebserverService";
import type { WebserverEndpoint } from "../../endpoints/WebserverEndpoint";
import type { ILoggingService } from "../logging/ILoggingService";
import { LogSeverity } from "../../models/logging/LogSeverity";
import type { Container } from "brandi";
import { TOKENS } from "../bootstrap";

export class BunWebserverService implements IWebserverService {
    endpoints: WebserverEndpoint[];
    logger: ILoggingService;
    container: Container;

    constructor(container: Container, webserverEndpoints: WebserverEndpoint[]) {
        this.endpoints = webserverEndpoints;
        this.container = container;
        this.logger = container.get(TOKENS.logger);
    }
    start(port: number): void {
        this.endpoints.forEach(endpoint => endpoint.injectDependencies(this.container));
        const routes = this.endpoints.map(endpoint => endpoint.toBunRoute()).flat();
        const logger = this.logger;

        Bun.serve({
            port,
            fetch(request: BunRequest) {
                const url = new URL(request.url);
                const method = request.method;

                const route = routes.find(r => r.method === method && r.path === url.pathname);
                if (route) {
                    return route.handler(request);
                } else {
                    logger.log(`No route found for ${method} ${url.pathname}`, LogSeverity.WARNING);
                    return new Response("Not Found", { status: 404 });
                }
            }
        });

        this.logger.log(`Webserver started on port: ${port}`, LogSeverity.INFO);
    }

    stop(): void {
        throw new Error("Not implemented.");
    }

}