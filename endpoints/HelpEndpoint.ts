import { Endpoint } from "../models/endpoints";
import { DI_TOKENS } from "../services/bootstrap";
import { WebserverEndpoint } from "./WebserverEndpoint";

type HelpRoute = {
    method: string;
    path: string;
};

@Endpoint
export class HelpEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "Help endpoint that prints off usage of api",
        tags: ["Index"],
        responses: {
            200: {
                description: "Operation Completed",
                body: {
                    help: "object"
                }
            },
        },
        auth: false
    };
    override get(request: Request): Promise<Response> {
        const routes = this.container.get(DI_TOKENS.endpoints)
            .flatMap((endpoint): HelpRoute[] => endpoint.toBunRoute().map(route => ({
                method: route.method,
                path: route.path
            })));

        return Promise.resolve(
            Response.json(
                {
                    message: "COMP74 API usage",
                    baseUrl: "http://localhost:3000",
                    help: {
                        publicRoutes: ["GET /", "GET /api/", "GET /help", "GET /api/help"],
                        protectedRoutes: [
                            "GET /api/wallets",
                            "POST /api/wallets/new",
                            "GET /api/transactions",
                            "POST /api/transactions/deposit",
                            "POST /api/transactions/withdraw",
                            "POST /api/transactions/transfer"
                        ],
                        authHeader: "Authorization: Bearer <token>",
                        quickStart: [
                            "1. Register or log in to get a JWT token.",
                            "2. Send the token in the Authorization header for protected routes.",
                            "3. Use the Bruno collection in bruno/ to try requests quickly."
                        ]
                    },
                    examples: [
                        {
                            name: "Check service health",
                            request: "GET /api/"
                        },
                        {
                            name: "List available routes",
                            request: "GET /api/help"
                        },
                        {
                            name: "Register a user",
                            request: "POST /api/auth/register",
                            body: {
                                username: "demo",
                                password: "secret"
                            }
                        },
                        {
                            name: "Log in and receive a token",
                            request: "POST /api/auth/login",
                            body: {
                                username: "demo",
                                password: "secret"
                            }
                        },
                        {
                            name: "Create a wallet",
                            request: "POST /api/wallets/new",
                            headers: {
                                Authorization: "Bearer <token>"
                            },
                            body: {
                                symbol: "BTC"
                            }
                        }
                    ],
                    routes
                },
                { status: 200 }
            )
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "GET",
                path: "/help",
                handler: this.get.bind(this)
            },
            {
                method: "GET",
                path: "/api/help",
                handler: this.get.bind(this)
            }
        ];
    }

}