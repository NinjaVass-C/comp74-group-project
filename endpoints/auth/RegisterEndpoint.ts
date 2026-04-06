import { Endpoint } from "../../models/endpoints";
import { DI_TOKENS } from "../../services/bootstrap";
import { usersTable } from "../../services/db/drizzle/schema";
import { WebserverEndpoint } from "../WebserverEndpoint";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";
import {ValidateString} from "../../utils/ValidationHelpers.ts";

@Endpoint
export class RegisterEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        try {
            const { username, password } = await request.json();

            if (!ValidateString(username) || !ValidateString(password)) {
                return ErrorResponse("Username and password is required.", 400);
            }

            const hashedPassword = await Bun.password.hash(password);

            const database = await this.container.get(DI_TOKENS.database).getConnection();
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