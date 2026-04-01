import { drizzle } from "drizzle-orm/bun-sqlite";
import type { IDatabaseService } from "../IDatabaseService";

type DrizzleConnection = ReturnType<typeof drizzle>;

export class DrizzleDatabaseService implements IDatabaseService {
    dbInstance: DrizzleConnection | null = null;

    getConnection(): Promise<DrizzleConnection> {
        if (this.dbInstance) return Promise.resolve(this.dbInstance);

        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL environment variable is not set.");
        }

        this.dbInstance = drizzle(connectionString);
        return Promise.resolve(this.dbInstance);
    }

}