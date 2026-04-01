import {defineConfig} from "drizzle-kit";

export default defineConfig({
    out: './drizzle',
    schema: './services/db/drizzle/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
})