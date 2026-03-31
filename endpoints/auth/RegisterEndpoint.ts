import { database } from "../../services/db/drizzle";
import { usersTable } from "../../services/db/schema";
import { WebserverEndpoint } from "../WebserverEndpoint";

export class RegisterEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        try {
            const { username, password } = await request.json();

            if (!username || !password) {
                return new Response(
                    JSON.stringify({ error: "Username and password are required." }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            const hashedPassword = await Bun.password.hash(password);

            const user = await database.insert(usersTable).values({
                username,
                password: hashedPassword
            }).returning();

            return new Response(
                JSON.stringify({ message: "User registered successfully.", user }),
                {
                    status: 201,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        } catch (error) {
            return new Response(
                JSON.stringify({ error: "Failed to register user.", details: error instanceof Error ? error.message : String(error) }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
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