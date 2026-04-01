import { Glob } from "bun";
import { resolve } from "node:path"

/**
 * Dynamically imports all endpoint classes from the "endpoints" directory and its subdirectories.
 * This is done so we can automatically register endpoints using the @Endpoint decorator.
 */
export async function importAllEndpoints() {
    const glob = new Glob("endpoints/**/*.ts");

    for await (const entry of glob.scan(".")) {
        await import(resolve(entry));
    }
}