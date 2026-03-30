
export interface IWebserverEndpoint {
    get(request: Request): Promise<Response>;
    post(request: Request): Promise<Response>;
    put(request: Request): Promise<Response>;
    delete(request: Request): Promise<Response>;

    toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response> }[];
}