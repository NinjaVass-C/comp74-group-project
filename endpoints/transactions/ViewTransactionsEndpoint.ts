import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import {transactionsTable} from "../../services/db/drizzle/schema";
import {eq, or} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";
import {RequireAuth} from "../../utils/RequireAuth.ts";

@Endpoint
export class ViewTransactionsEndpoint extends WebserverEndpoint {
    override async get(request: Request): Promise<Response> {
        const auth = await RequireAuth(request);
        if (!auth.success) {
            return auth.error;
        }
        const userToken = auth.user;

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const transactions = database.select().from(transactionsTable)
            .where(or(eq(transactionsTable.payeeId, userToken.user.id), eq(transactionsTable.payerId, userToken.user.id)))
            .all();

        return Response.json(
            { transactions },
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