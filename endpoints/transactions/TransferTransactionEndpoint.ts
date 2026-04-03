import { jwtVerify } from "jose";
import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import type { TokenPayload } from "../../models/auth/TokenPayload";
import { walletsTable, usersTable, transactionsTable } from "../../services/db/drizzle/schema";
import {and, eq, sql} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";

@Endpoint
export class TransferTransactionEndpoint extends WebserverEndpoint {
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
            if (!payeeWallet || typeof payeeWallet !== 'number' || payeeWallet <=0) {
                return Promise.resolve(
                    Response.json(
                        { error: "Missing required field: payeeWallet" },
                        { status: 400 }
                    )
                );
            }
            if (!payee || typeof payee !== 'number' || payee <=0) {
                return Promise.resolve(
                    Response.json(
                        { error: "Missing required field: payee" },
                        { status: 400 }
                    )
                );
            }
            if (!payerWallet || typeof payerWallet !== 'number' || payerWallet <=0) {
                return Promise.resolve(
                    Response.json(
                        { error: "Missing required field: payerWallet" },
                        { status: 400 }
                    )
                );
            }
            if (!amount || typeof amount !== 'number' || amount <=0) {
                return Promise.resolve(
                    Response.json(
                        { error: "Missing required field: amount" },
                        { status: 400 }
                    )
                )
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

        // validate that the payee exists and their wallet exists.

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const validPayee = database.select().from(walletsTable)
            .where(and(eq(walletsTable.userId, payee), eq(walletsTable.id, payeeWallet)))
            .get();

        if (!validPayee) {
            return Promise.resolve(
                Response.json(
                    { error: "Payee/wallet not found" },
                    { status: 404 }
                )
            );
        }

        // validate payerWallet exists, and they have the balance
        const payerId = userToken.payload.user.id;

        const validPayer = database.select().from(walletsTable)
            .where(and(eq(walletsTable.userId, payerId), eq(walletsTable.id, payerWallet)))
            .get();

        if (!validPayer) {
            return Promise.resolve(
                Response.json(
                    { error: "Wallet not found" },
                    { status: 404 }
                )
            );
        }

        if (validPayer.balance < amount || validPayer.symbol !== validPayee.symbol) {
            return Promise.resolve(
                Response.json(
                    {error: "Insufficient funds"},
                    { status: 422 }
                )
            )
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

        return Promise.resolve(
            Response.json(
                { transaction },
                { status: 200 }
            )
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