import { Endpoint } from "../../models/endpoints";
import { WebserverEndpoint } from "../WebserverEndpoint";
import {usersTable, walletsTable } from "../../services/db/drizzle/schema";
import { DI_TOKENS } from "../../services/bootstrap";
import { reset } from "drizzle-seed";
import * as schema from "../../services/db/drizzle/schema.ts"

@Endpoint
export class SeedDatabaseEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        const database = await this.container.get(DI_TOKENS.database).getConnection();
        const seederPassword = await Bun.password.hash("Test123");
        // reset the database
        await reset(database, schema)
        // Create mock users
        const users = await database.insert(usersTable).values([
            { username: 'user1', password: seederPassword },
            { username: 'user2', password: seederPassword },
            { username: 'user3', password: seederPassword },
            { username: 'user4', password: seederPassword },
            { username: 'user5', password: seederPassword },
        ]).returning();
        // create mock wallets
        await database.insert(walletsTable).values([
            {userId: users[0].id, symbol: "AMZN", balance: 500},
            {userId: users[1].id, symbol: "AMZN", balance: 200},
            {userId: users[2].id, symbol: "AMZN", balance: 300},
            {userId: users[3].id, symbol: "AMZN", balance: 500},
            {userId: users[4].id, symbol: "AMZN", balance: 500},
            {userId: users[0].id, symbol: "AAPL", balance: 0},
            {userId: users[3].id, symbol: "AAPL", balance: 800},
            {userId: users[0].id, symbol: "TSLA", balance: 500},
        ])
        return Response.json({status: 200})
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "POST",
                path: "/api/utility/seed",
                handler: this.post.bind(this)
            },
        ];
    }

}