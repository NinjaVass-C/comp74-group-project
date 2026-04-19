import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import {transactionsTable, walletsTable} from "../../services/db/drizzle/schema";
import {eq, or, count} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";
import {RequireAuth} from "../../utils/RequireAuth.ts";
import {ValidateNumber} from "../../utils/ValidationHelpers.ts";

@Endpoint
export class ViewTransactionsEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "View past transactions for user",
        tags: ["Transactions"],
        query: {
            page: { type: "integer", default: 1 },
            page_size: { type: "integer", default: 10 }
        },
        responses: {
            200: {
                description: "Transactions Listed",
                body: {
                    "transactions": {
                        type: "array",
                        items: {
                            id: {type: "integer", description: "Transaction id based of db pk"},
                            payeeId: {type: "integer", description: "User id of the payee"},
                            payeeWalletId: {type: "integer", description: "Wallet id of the payee"},
                            payerId: {type: "integer", description: "User id of the payer"},
                            payerWalletId: {type: "integer", description: "Wallet id of the payer"},
                            amount: { type: "number", description: "Amount transacted"},
                            symbol: {type: "string", description: "Symbol that was transacted"},
                            createdAt: {type: "string", description: "Timestamp when transaction was created"},
                        }
                    }
                }
            },
            401: { description: "Unauthorized" },
        },

        auth: true
    };
    override async get(request: Request): Promise<Response> {
        const auth = await RequireAuth(request);
        if (!auth.success) {
            return auth.error;
        }
        const userToken = auth.user;

        const url = new URL(request.url);
        let page = 1
        let pageSize = 10
        const pageQuery = Number(url.searchParams.get("page"));
        const pageSizeQuery = Number(url.searchParams.get("page_size"));
        if (pageQuery && ValidateNumber(pageQuery)) {
            page = pageQuery;
        }
        if (pageSizeQuery && ValidateNumber(pageQuery)) {
            pageSize = pageSizeQuery;
        }

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const transactions = database.select().from(transactionsTable)
            .where(or(eq(transactionsTable.payeeId, userToken.user.id), eq(transactionsTable.payerId, userToken.user.id)))
            .limit(pageSize)
            .offset((page - 1) * pageSize)
            .all();
        const total = await database.select({ count: count() }).from(transactionsTable)
            .where(or(eq(transactionsTable.payeeId, userToken.user.id), eq(transactionsTable.payerId, userToken.user.id)));
        const pageInfo = {
            page: page,
            pageSize: pageSize,
            total: total[0]?.count ?? 0,
        }


        return Response.json(
            { pageInfo, transactions },
            { status: 200 }
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "GET",
                path: "/api/transactions",
                handler: this.get.bind(this)
            }
        ];
    }

}