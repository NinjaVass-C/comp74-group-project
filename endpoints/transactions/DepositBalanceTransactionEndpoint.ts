import { jwtVerify } from "jose";
import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import type { TokenPayload } from "../../models/auth/TokenPayload";
import { walletsTable } from "../../services/db/drizzle/schema";
import {and, eq, sql} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";

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
                return Promise.resolve(
                    Response.json(
                        { error: "Missing required field: payeeWallet" },
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

        // validate that the wallet exists

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const validWallet = database.select().from(walletsTable)
            .where(and(eq(walletsTable.userId, userToken.payload.user.id), eq(walletsTable.id, wallet)))
            .get();

        console.log(validWallet, wallet, userToken.payload.user.id);
        if (!validWallet) {
            return Promise.resolve(
                Response.json(
                    { error: "Wallet not found" },
                    { status: 404 }
                )
            );
        }

        const add = await database.update(walletsTable).set( { balance: sql`${walletsTable.balance} + ${amount}` })
            .where(eq(walletsTable.id, wallet))
            .returning().get();

        return Promise.resolve(
            Response.json(
                { add },
                { status: 200 }
            )
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