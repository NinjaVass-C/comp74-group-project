
export class WebserverEndpoint {
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

    toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response> }[] {
        throw new Error("Method not implemented.");
    }
}