import type { BunRequest } from "bun";
import type { IWebserverService } from "./IWebserverService";
import type { WebserverEndpoint } from "../../endpoints/WebserverEndpoint";
import type { ILoggingService } from "../logging/ILoggingService";
import { LogSeverity } from "../../models/logging/LogSeverity";
import type { Container } from "brandi";
import { DI_TOKENS } from "../bootstrap";

export class BunWebserverService implements IWebserverService {
    endpoints: WebserverEndpoint[];
    logger: ILoggingService;
    container: Container;

    constructor(container: Container, webserverEndpoints: WebserverEndpoint[]) {
        this.endpoints = webserverEndpoints;
        this.container = container;
        this.logger = container.get(DI_TOKENS.logger);
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
                if (!route) {
                    // Try to match dynamic routes (e.g., /api/symbol/:symbol)
                    const dynamicRoute = routes.find(r => {
                        if (r.method !== method) return false;
                        const routeParts = r.path.split("/").filter(Boolean);
                        const urlParts = url.pathname.split("/").filter(Boolean);
                        if (routeParts.length !== urlParts.length) return false;
                        return routeParts.every((part, index) => part.startsWith(":") || part === urlParts[index]);
                    });

                    if (dynamicRoute) {
                        // Extract params
                        const routeParts = dynamicRoute.path.split("/").filter(Boolean);
                        const urlParts = url.pathname.split("/").filter(Boolean);
                        const params: Record<string, string> = {};
                        routeParts.forEach((part, index) => {
                            if (part.startsWith(":")) {
                                const paramName = part.slice(1);
                                if (urlParts[index]) {
                                    params[paramName] = urlParts[index];
                                }
                            }
                        });
                        // Attach params to request
                        (request as any).params = params;
                        return dynamicRoute.handler(request);
                    }
                }

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