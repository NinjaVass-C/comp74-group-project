import { eq } from "drizzle-orm";
import { usersTable } from "../../services/db/drizzle/schema";
import { WebserverEndpoint } from "../WebserverEndpoint";
import { jwtVerify } from "jose";
import { DI_TOKENS } from "../../services/bootstrap";
import { LogSeverity } from "../../models/logging/LogSeverity";
import { TokenPayload } from "../../models/auth/TokenPayload";
import { Endpoint } from "../../models/endpoints";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";

@Endpoint
export class VerifyTokenEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "Verify token is still valid",
        tags: ["Auth"],

        body: {
            required: ["token"],
            properties: {
                token: {type: "string"},
            }
        },

        responses: {
            200: {
                description: "Login successful",
                body: {
                    id: {type: "integer", description: "User id based of db pk"},
                    username: {type: "string", description: "Users name for logins"},
                }
            },
            400: { description: "Invalid request" },
            401: { description: "Unauthorized" },
            500: { description: "Server error" },
        },

        auth: false
    };


    override async post(request: Request): Promise<Response> {
        try {
            const { token } = await request.json();

            if (!token) {
                return ErrorResponse("Token is required.", 400);
            }

            const userToken = await jwtVerify<TokenPayload>(token, new TextEncoder().encode(process.env.JWT_SECRET));
            if (!userToken) {
                return ErrorResponse("Invalid token.", 401);
            }

            const database = await this.container.get(DI_TOKENS.database).getConnection();
            const user = database.select().from(usersTable)
                .where(eq(usersTable.id, userToken.payload.user.id))
                .get();

            if (!user) {
                return ErrorResponse("Invalid token.", 401)
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