import { jwtVerify } from "jose";
import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import type { TokenPayload } from "../../models/auth/TokenPayload";
import { walletsTable, usersTable, transactionsTable } from "../../services/db/drizzle/schema";
import {and, eq, sql} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";
import { ErrorResponse } from "../../utils/ErrorResponse";
import {RequireAuth} from "../../utils/RequireAuth.ts";
import {ValidateNumber} from "../../utils/ValidationHelpers.ts";

@Endpoint
export class WithdrawBalanceTransactionEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "Withdraw balance from wallet",
        tags: ["Transactions"],

        body: {
            required: ["wallet", "amount"],
            properties: {
                wallet: { type: "number" },
                amount: { type: "number" },
            }
        },

        responses: {
            200: {
                description: "Withdraw Completed",
                body: {
                    id: {type: "integer", description: "Wallet id based of db pk"},
                    userId: {type: "integer", description: "User id associated to wallet"},
                    symbol: {type: "string", description: "Symbol being kept in wallet"},
                    balance: {type: "number", description: "Balance of wallet"},
                    createdAt: {type: "string", description: "Timestamp of wallet creation"},
                }
            },
            400: { description: "Invalid request" },
            401: { description: "Unauthorized" },
            404: { description: "Wallet not found" },
            422: { description: "Insufficient funds" }
        },

        auth: true
    };

    override async post(request: Request): Promise<Response> {
        let wallet = null;
        let amount = null;
        try {
            const response = await request.json();
            wallet = response.wallet;
            amount = response.amount;
            if (!ValidateNumber(wallet, true)) {
                return ErrorResponse("Missing required field: wallet", 400)
            }
            if (!ValidateNumber(amount, true)) {
                return ErrorResponse("Missing required field: amount", 400)
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
            return ErrorResponse("Wallet Not Found", 404)
        }

        if (validWallet.balance < amount) {
            return ErrorResponse("Insufficient Funds.", 422);
        }

        const withdraw = await database.update(walletsTable).set( { balance: sql`${walletsTable.balance} - ${amount}` })
            .where(eq(walletsTable.id, wallet))
            .returning().get();

        return Promise.resolve(
            Response.json(
                { withdraw },
                { status: 200 }
            )
        );

    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "POST",
                path: "/api/transactions/withdraw",
                handler: this.post.bind(this)
            }
        ];
    }
}