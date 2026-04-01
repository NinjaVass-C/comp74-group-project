import { jwtVerify } from "jose";
import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import type { TokenPayload } from "../../models/auth/TokenPayload";
import { walletsTable } from "../../services/db/drizzle/schema";
import { DI_TOKENS } from "../../services/bootstrap";

@Endpoint
export class NewWalletsEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        let symbol = null;

        try {
            const response = await request.json();
            symbol = response.symbol;

            if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
                return Promise.resolve(
                    Response.json(
                        { error: "Missing required field: symbol" },
                        { status: 400 }
                    )
                );
            }
        } catch (error) {
            return Promise.resolve(
                Response.json(
                    { error: "Invalid JSON body", details: error instanceof Error ? error.message : String(error) },
                    { status: 400 }
                )
            );
        }

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return Promise.resolve(
                Response.json(
                    { error: "Missing or invalid Authorization header" },
                    { status: 401 }
                )
            );
        }

        const token = authHeader.substring(7); // remove bearer

        const userToken = await jwtVerify<TokenPayload>(token, new TextEncoder().encode(process.env.JWT_SECRET));
        if (!userToken) {
            return Response.json(
                { error: "Invalid token." },
                { status: 401 }
            );
        }

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const wallet = database.insert(walletsTable)
            .values({
                userId: userToken.payload.user.id,
                balance: 0,
                symbol: symbol.trim()
            })
            .returning().get();

        return Promise.resolve(
            Response.json(
                { wallet },
                { status: 200 }
            )
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "POST",
                path: "/api/wallets/new",
                handler: this.post.bind(this)
            }
        ];
    }

}