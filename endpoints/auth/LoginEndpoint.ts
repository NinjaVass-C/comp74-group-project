import { eq } from "drizzle-orm";
import { usersTable } from '../../services/db/drizzle/schema';
import { WebserverEndpoint } from "../WebserverEndpoint";
import { SignJWT } from "jose";
import { DI_TOKENS } from "../../services/bootstrap";
import { LogSeverity } from "../../models/logging/LogSeverity";
import { TokenPayload } from "../../models/auth/TokenPayload";
import { Endpoint } from "../../models/endpoints";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";
import {ValidateString} from "../../utils/ValidationHelpers.ts";

@Endpoint
export class LoginEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "Login endpoint to allow user to get auth token",
        tags: ["Auth"],

        body: {
            required: ["username", "password"],
            properties: {
                username: {type: "string"},
                password: {type: "string"},
            }
        },

        responses: {
            200: {
                description: "Login successful",
                body: {
                    token: {type: "string", description: "Authentication token"},
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
            const { username, password } = await request.json();

            if (!ValidateString(username) || !ValidateString(password)) {
                return ErrorResponse("Username and password are required.", 400);
            }

            const database = await this.container.get(DI_TOKENS.database).getConnection();
            const user = database.select()
                            .from(usersTable)
                            .where(eq(usersTable.username, username))
                            .get();

            if (!user) {
                return ErrorResponse("Invalid username or password.", 401);
            }

            const passwordMatch = await Bun.password.verify(password, user.password);

            if (!passwordMatch) {
                return ErrorResponse("Invalid username or password.", 401);
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