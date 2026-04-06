import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import { walletsTable } from "../../services/db/drizzle/schema";
import { eq } from 'drizzle-orm';
import { DI_TOKENS } from "../../services/bootstrap";
import { RequireAuth } from "../../utils/RequireAuth.ts";

@Endpoint
export class WalletsListEndpoint extends WebserverEndpoint {
    override async get(request: Request): Promise<Response> {
        const auth = await RequireAuth(request);
        if (!auth.success) {
            return auth.error;
        }
        const userToken = auth.user;

        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const wallets = database.select().from(walletsTable)
            .where(eq(walletsTable.userId, userToken.user.id))
            .all();

        return Response.json(
            { wallets },
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