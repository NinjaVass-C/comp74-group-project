import type { BunRequest } from "bun";
import type { IWebserverService } from "./IWebserverService";
import type { IWebserverEndpoint } from "./IWebserverEndpoint";

export class BunWebserverService implements IWebserverService {
    endpoints: IWebserverEndpoint[];

    constructor(webserverEndpoints: IWebserverEndpoint[]) {
        this.endpoints = webserverEndpoints;
    }
    start(port: number): void {
        const routes = this.endpoints.map(endpoint => endpoint.toBunRoute()).flat();
        Bun.serve({
            port,
            fetch: async (request: BunRequest) => {
                const url = new URL(request.url);
                const route = routes.find(r => r.method === request.method && r.path === url.pathname);
                if (route) {
                    return await route.handler(request);
                } else {
                    return new Response("Not Found", { status: 404 });
                }
            }
        });
    }
    stop(): void {

    }

}