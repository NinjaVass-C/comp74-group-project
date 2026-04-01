import { sql, type InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: int().primaryKey({ autoIncrement: true }),
    username: text().notNull(),
    password: text().notNull(),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const walletsTable = sqliteTable("wallets", {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int().notNull(),
    symbol: text().notNull(),
    balance: int().notNull(),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type User = InferSelectModel<typeof usersTable>;
export type Wallet = InferSelectModel<typeof walletsTable>;
