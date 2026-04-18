import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import { DI_TOKENS } from "../../services/bootstrap";
import { reset } from "drizzle-seed";
import * as schema from "../../services/db/drizzle/schema.ts"

@Endpoint
export class TruncateDatabaseEndpoint extends WebserverEndpoint {
    override async delete(request: Request): Promise<Response> {
        const database = await this.container.get(DI_TOKENS.database).getConnection();
        await reset(database, schema)
        return Response.json({status: 200})
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "DELETE",
                path: "/api/utility/truncate",
                handler: this.delete.bind(this)
            },
        ];
    }

}