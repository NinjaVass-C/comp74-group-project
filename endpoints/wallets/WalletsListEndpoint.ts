import { jwtVerify } from "jose";
import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import type { TokenPayload } from "../../models/auth/TokenPayload";
import { database } from "../../services/db/drizzle";
import { walletsTable } from "../../services/db/schema";
import { eq } from 'drizzle-orm';

@Endpoint
export class WalletsListEndpoint extends WebserverEndpoint {
    override async get(request: Request): Promise<Response> {
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

        const wallets = database.select().from(walletsTable)
            .where(eq(walletsTable.userId, userToken.payload.user.id))
            .all();

        return Promise.resolve(
            Response.json(
                { wallets },
                { status: 200 }
            )
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "GET",
                path: "/api/wallets",
                handler: this.get.bind(this)
            }
        ];
    }

}