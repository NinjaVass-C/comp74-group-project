import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import { walletsTable } from "../../services/db/drizzle/schema";
import {count, eq} from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";
import { RequireAuth } from "../../utils/RequireAuth.ts";
import {ValidateNumber} from "../../utils/ValidationHelpers.ts";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";

@Endpoint
export class WalletsListEndpoint extends WebserverEndpoint {
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
        const wallets = database.select().from(walletsTable)
            .where(eq(walletsTable.userId, userToken.user.id))
            .limit(pageSize)
            .offset((page - 1) * pageSize)
            .all();
        const total = await database.select({ count: count() }).from(walletsTable)
            .where(eq(walletsTable.userId, userToken.user.id))
        const pageInfo = {
            page: page,
            pageSize: pageSize,
            total: total[0]?.count ?? 0,
        }
        return Response.json(
            { pageInfo, wallets },
            { status: 200 }
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