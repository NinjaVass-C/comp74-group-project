import { eq } from "drizzle-orm";
import { database } from "../../services/db/drizzle";
import { usersTable } from "../../services/db/schema";
import { WebserverEndpoint } from "../WebserverEndpoint";
import { jwtVerify, SignJWT } from "jose";
import { DI_TOKENS } from "../../services/bootstrap";
import { LogSeverity } from "../../models/logging/LogSeverity";
import { TokenPayload } from "../../models/auth/TokenPayload";
import { Endpoint } from "../../models/endpoints";

@Endpoint
export class VerifyTokenEndpoint extends WebserverEndpoint {
    override async post(request: Request): Promise<Response> {
        try {
            const { token } = await request.json();

            if (!token) {
                return Response.json(
                    { error: "Token is required." },
                    { status: 400 }
                );
            }

            const userToken = await jwtVerify<TokenPayload>(token, new TextEncoder().encode(process.env.JWT_SECRET));
            if (!userToken) {
                return Response.json(
                    { error: "Invalid token." },
                    { status: 401 }
                );
            }

            const user = database.select().from(usersTable)
                .where(eq(usersTable.id, userToken.payload.user.id))
                .get();

            if (!user) {
                return Response.json(
                    { error: "Invalid token." },
                    { status: 401 }
                );
            }

            return Response.json(
                { message: "Token is valid.", user: { id: user.id, username: user.username } },
                { status: 200 }
            );
        } catch (error) {
            if (this.container) {
                const logger = this.container.get(DI_TOKENS.logger);
                logger.log(`Token verification failed: ${error instanceof Error ? error.message : String(error)}`, LogSeverity.ERROR);
            }

            return Response.json(
                { error: "Failed to verify token.", details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        }
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "POST",
                path: "/api/auth/verify_token",
                handler: this.post.bind(this)
            }
        ];
    }

}