import { eq } from "drizzle-orm";
import { database } from "../../services/db/drizzle";
import { usersTable } from "../../services/db/schema";
import { WebserverEndpoint } from "../WebserverEndpoint";
import { SignJWT } from "jose";
import { TOKENS } from "../../services/bootstrap";
import { LogSeverity } from "../../models/logging/LogSeverity";

export class LoginEndpoint extends WebserverEndpoint {
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

            const user = await database.select().from(usersTable).where(eq(usersTable.username, username)).get();

            if (!user) {
                return new Response(
                    JSON.stringify({ error: "Invalid username or password." }),
                    {   
                        status: 401,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            const passwordMatch = await Bun.password.verify(password, user.password);

            if (!passwordMatch) {
                return new Response(
                    JSON.stringify({ error: "Invalid username or password." }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

            const jwt = await new SignJWT({ user: { id: user.id, username: user.username } })
                .setProtectedHeader({ alg: "HS256", typ: "JWT" })
                .setExpirationTime("2h")
                .sign(secret);

            return new Response(
                JSON.stringify({ message: "Login successful.", token: jwt }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        } catch (error) {
            if(this.container){
                const logger = this.container.get(TOKENS.logger);
                logger.log(`User login failed: ${error instanceof Error ? error.message : String(error)}`, LogSeverity.ERROR);
            }

            return new Response(
                JSON.stringify({ error: "Failed to login.", details: error instanceof Error ? error.message : String(error) }),
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
                path: "/api/auth/login",
                handler: this.post.bind(this)
            }
        ];
    }

}