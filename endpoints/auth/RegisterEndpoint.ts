import { Endpoint } from "../../models/endpoints";
import { database } from "../../services/db/drizzle";
import { usersTable } from "../../services/db/schema";
import { WebserverEndpoint } from "../WebserverEndpoint";

@Endpoint
export class RegisterEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        try {
            const { username, password } = await request.json();

            if (!username || !password) {
                return Response.json(
                    { error: "Username and password are required." },
                    { status: 400 }
                );
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