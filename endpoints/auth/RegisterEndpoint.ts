import { Endpoint } from "../../models/endpoints";
import { DI_TOKENS } from "../../services/bootstrap";
import {usersTable, walletsTable} from "../../services/db/drizzle/schema";
import { WebserverEndpoint } from "../WebserverEndpoint";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";
import {ValidateString} from "../../utils/ValidationHelpers.ts";
import {eq} from "drizzle-orm";

@Endpoint
export class RegisterEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "Register endpoint to create new account",
        tags: ["Auth"],

        body: {
            required: ["username", "password"],
            properties: {
                username: {type: "string"},
                password: {type: "string"},
            }
        },

        responses: {
            201: {
                description: "Account created successfully",
                body: {
                    id: {type: "integer", description: "User id based of db pk"},
                    username: {type: "string", description: "Users name for logins"},
                    password: {type: "string", description: "Hashed Password"},
                    createdAt: {type: "string", description: "Timestamp of account creation"},
                }
            },
            400: { description: "Invalid request" },
            500: { description: "Server error" },
        },

        auth: false
    };
    override async post(request: Request): Promise<Response> {
        try {
            const { rawUsername, password } = await request.json();

            if (!ValidateString(rawUsername) || !ValidateString(password)) {
                return ErrorResponse("Username and password is required.", 400);
            }
            const username = rawUsername.trim();
            const database = await this.container.get(DI_TOKENS.database).getConnection();

            // Validate the username does not exist before creation
            const usernameExists = database.select().from(usersTable)
                .where(eq(usersTable.username, username))
                .get();
            if (usernameExists) {
                return ErrorResponse("Username is already taken", 400)
            }

            const hashedPassword = await Bun.password.hash(password);


            const user = await database.insert(usersTable)
                .values({
                    username,
                    password: hashedPassword
                }).returning();

            return Response.json(
                { message: "User registered successfully.", user },
                { status: 201 }
            );
            
        } catch (error) {
            return Response.json(
                { error: "Failed to register user.", details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        }
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "POST",
                path: "/api/auth/register",
                handler: this.post.bind(this)
            }
        ];
    }

}