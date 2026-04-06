import { jwtVerify } from "jose";
import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import type { TokenPayload } from "../../models/auth/TokenPayload";
import { walletsTable } from "../../services/db/drizzle/schema";
import { DI_TOKENS } from "../../services/bootstrap";
import {RequireAuth} from "../../utils/RequireAuth.ts";
import { ErrorResponse } from "../../utils/ErrorResponse.ts";
import {ValidateString} from "../../utils/ValidationHelpers.ts";

@Endpoint
export class NewWalletsEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        let symbol = null;

        try {
            const response = await request.json();
            symbol = response.symbol;

            if (!ValidateString(symbol)) {
                return ErrorResponse("Missing required field: symbol.", 400);
            }
        } catch (error) {
            return ErrorResponse("Invalid JSON body", 400, error instanceof Error ? error.message : String(error))
        }

        const auth = await RequireAuth(request);
        if (!auth.success) {
            return auth.error;
        }
        const userToken = auth.user;

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const wallet = database.insert(walletsTable)
            .values({
                userId: userToken.user.id,
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