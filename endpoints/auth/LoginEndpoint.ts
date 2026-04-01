import { eq } from "drizzle-orm";
import { usersTable } from '../../services/db/drizzle/schema';
import { WebserverEndpoint } from "../WebserverEndpoint";
import { SignJWT } from "jose";
import { DI_TOKENS } from "../../services/bootstrap";
import { LogSeverity } from "../../models/logging/LogSeverity";
import { TokenPayload } from "../../models/auth/TokenPayload";
import { Endpoint } from "../../models/endpoints";

@Endpoint
export class LoginEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        try {
            const { username, password } = await request.json();

            if (!username || !password) {
                return Response.json(
                    { error: "Username and password are required." },
                    { status: 400 }
                );
            }

            const database = await this.container.get(DI_TOKENS.database).getConnection();
            const user = database.select()
                            .from(usersTable)
                            .where(eq(usersTable.username, username))
                            .get();

            if (!user) {
                return Response.json(
                    { error: "Invalid username or password." },
                    { status: 401 }
                );
            }

            const passwordMatch = await Bun.password.verify(password, user.password);

            if (!passwordMatch) {
                return Response.json(
                    { error: "Invalid username or password." },
                    { status: 401 }
                );
            }

            const encoder = new TextEncoder().encode(process.env.JWT_SECRET!);
            const tokenPayload = new TokenPayload({ id: user.id, username: user.username });

            const jwt = await new SignJWT({ ...tokenPayload })
                .setProtectedHeader({ alg: "HS256", typ: "JWT" })
                .setExpirationTime("2h")
                .sign(encoder);

            return Response.json(
                { message: "Login successful.", token: jwt },
                { status: 200 }
            );
        } catch (error) {
            if (this.container) {
                const logger = this.container.get(DI_TOKENS.logger);
                logger.log(`User login failed: ${error instanceof Error ? error.message : String(error)}`, LogSeverity.ERROR);
            }

            return Response.json(
                { error: "Failed to login.", details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
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