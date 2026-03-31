import type { Container } from "brandi";
import type { BunRequest } from "bun";

export class WebserverEndpoint {
    protected container?: Container;

    get(request: Request): Promise<Response> {
        throw new Error("Method not implemented.");
    }
    
    post(request: Request): Promise<Response> {
        throw new Error("Method not implemented.");
    }
    
    put(request: Request): Promise<Response> {
        throw new Error("Method not implemented.");
    }

    delete(request: Request): Promise<Response> {
        throw new Error("Method not implemented.");
    }

    toBunRoute(): { method: string; path: string; handler: (request: BunRequest) => Promise<Response> }[] {
        throw new Error("Method not implemented.");
    }

    injectDependencies(container: Container): void {
        this.container = container;
    }
}