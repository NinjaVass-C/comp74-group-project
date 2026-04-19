import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import { walletsTable, usersTable, transactionsTable } from "../../services/db/drizzle/schema";
import {and, eq, sql} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";
import {RequireAuth} from "../../utils/RequireAuth.ts";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";
import {ValidateNumber} from "../../utils/ValidationHelpers.ts";

@Endpoint
export class TransferTransactionEndpoint extends WebserverEndpoint {
     override openapi = {
        summary: "Perform transaction between users wallet and another users wallet",
        tags: ["Transactions"],

        body: {
            required: ["payeeWallet", "payee", "payerWallet", "amount"],
            properties: {
                payeeWallet: { type: "number" },
                payee: { type: "number" },
                payerWallet: { type: "number" },
                amount: { type: "number" },
            }
        },

        responses: {
            200: {
                description: "Transaction Completed",
                body: {
                    id: {type: "integer", description: "Transaction id based of db pk"},
                    payeeId: {type: "integer", description: "User id of the payee"},
                    payeeWalletId: {type: "integer", description: "Wallet id of the payee"},
                    payerId: {type: "integer", description: "User id of the payer"},
                    payerWalletId: {type: "integer", description: "Wallet id of the payer"},
                    amount: { type: "number", description: "Amount transacted"},
                    symbol: {type: "string", description: "Symbol that was transacted"},
                    createdAt: {type: "string", description: "Timestamp when transaction was created"},
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
        let payee = null;
        let payeeWallet = null;
        let payerWallet = null;
        let amount = null;
        try {
            const response = await request.json();
            payeeWallet = response.payeeWallet;
            payee = response.payee;
            payerWallet = response.payerWallet;
            amount = response.amount;
            if (!ValidateNumber(payeeWallet, true)) {
                return ErrorResponse("Missing required field: payeeWallet", 400);
            }
            if (!ValidateNumber(payee, true)) {
                return ErrorResponse("Missing required field: payee", 400);
            }
            if (!ValidateNumber(payerWallet, true)) {
                return ErrorResponse("Missing required field: payerWallet", 400);
            }
            if (!ValidateNumber(amount, true)) {
                return ErrorResponse("Missing required field: amount", 400);
            }
        } catch (error) {
            return ErrorResponse("Invalid JSON body", 400, error instanceof Error ? error.message : String(error))
        }

        const auth = await RequireAuth(request);
        if (!auth.success) {
            return auth.error;
        }
        const userToken = auth.user;

        // validate that the payee exists and their wallet exists.

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const validPayee = database.select().from(walletsTable)
            .where(and(eq(walletsTable.userId, payee), eq(walletsTable.id, payeeWallet)))
            .get();

        if (!validPayee) {
            return ErrorResponse("Payee/Wallet Not Found.", 404);
        }

        // validate payerWallet exists, and they have the balance
        const payerId = userToken.user.id;

        const validPayer = database.select().from(walletsTable)
            .where(and(eq(walletsTable.userId, payerId), eq(walletsTable.id, payerWallet)))
            .get();

        if (!validPayer) {
            return ErrorResponse("Wallet Not Found.", 404);
        }

        if (validPayer.balance < amount || validPayer.symbol !== validPayee.symbol) {
            return ErrorResponse("Insufficient Funds.", 422);
        }
        // all checks are valid, update and insert

        await database.update(walletsTable).set( { balance: sql`${walletsTable.balance} - ${amount}` })
            .where(eq(walletsTable.id, payerWallet));

        await database.update(walletsTable).set( { balance: sql`${walletsTable.balance} + ${amount}` })
            .where(eq(walletsTable.id, payeeWallet));

        const symbol = validPayer.symbol;
        const transaction = await database.insert(transactionsTable)
            .values({
                payeeId: payee,
                payeeWalletId: payeeWallet,
                payerId: payerId,
                payerWalletId: payerWallet,
                amount: amount,
                symbol: symbol,
            }).returning().get();

        return Response.json(
            { transaction },
            { status: 200 }
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "POST",
                path: "/api/transactions/transfer",
                handler: this.post.bind(this)
            }
        ];
    }
}