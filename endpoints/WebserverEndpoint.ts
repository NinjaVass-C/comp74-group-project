import type { Container } from "brandi";
import type { BunRequest } from "bun";

export type OpenApiMeta = {
    summary?: string;
    tags?: string[];
    auth?: boolean;

    query?: Record<
        string,
        {
            type: string;
            required?: boolean;
            default?: any;
        }
    >;

    body?: {
        required?: string[];
        properties?: Record<string, any>;
    };

    responses?: Record<
        number,
        {
            description: string;
            body?: Record<string, any>;
        }
    >;
};

export class WebserverEndpoint {
    protected container!: Container;
    openapi?: OpenApiMeta;


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