import { WebserverEndpoint } from "./WebserverEndpoint";

export class IndexEndpoint extends WebserverEndpoint {
    override get(request: Request): Promise<Response> {
        return Promise.resolve(
            new Response(
                JSON.stringify({
                    message: "COMP74 API is running",
                    timestamp: new Date().toISOString()
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "GET",
                path: "/",
                handler: this.get.bind(this)
            },
            {
                method: "GET",
                path: "/api/",
                handler: this.get.bind(this)
            }
        ];
    }

}