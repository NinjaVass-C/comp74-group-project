import { jwtVerify } from "jose";
import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import type { TokenPayload } from "../../models/auth/TokenPayload";
import { walletsTable } from "../../services/db/drizzle/schema";
import {and, eq, sql} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";
import { ErrorResponse } from "../../utils/ErrorResponse.ts";
import {RequireAuth} from "../../utils/RequireAuth.ts";

@Endpoint
export class TransferTransactionEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        let wallet = null;
        let amount = null;
        try {
            const response = await request.json();
            wallet = response.wallet;
            amount = response.amount;
            if (!wallet || typeof wallet !== 'number' || wallet <=0) {
                return ErrorResponse("Missing require field: payeeWallet.", 400)
            }
            if (!amount || typeof amount !== 'number' || amount <=0) {
                return ErrorResponse("Missing required field: amount.", 400)
            }
        } catch (error) {
            return ErrorResponse("Invalid JSON body", 400, error instanceof Error ? error.message : String(error))
        }

        const auth = await RequireAuth(request);
        if (!auth.success) {
            return auth.error;
        }
        const userToken = auth.user;

        // validate that the wallet exists

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const validWallet = database.select().from(walletsTable)
            .where(and(eq(walletsTable.userId, userToken.user.id), eq(walletsTable.id, wallet)))
            .get();

        if (!validWallet) {
            return ErrorResponse("Wallet Not Found.", 404)
        }

        const add = await database.update(walletsTable).set( { balance: sql`${walletsTable.balance} + ${amount}` })
            .where(eq(walletsTable.id, wallet))
            .returning().get();

        return Response.json(
            { add },
            { status: 200 }
        );

    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "POST",
                path: "/api/transactions/deposit",
                handler: this.post.bind(this)
            }
        ];
    }
}