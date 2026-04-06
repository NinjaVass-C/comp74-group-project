import type {TokenPayload} from "../models/auth/TokenPayload.ts";
import {jwtVerify} from "jose";

type AuthResult =
    | { success: true; user: TokenPayload }
    | { success: false; error: Response };



export async function RequireAuth(request: Request): Promise<AuthResult> {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            success: false,
            error: Response.json(
                { success: false, error: "Missing or invalid Authorization header" },
                { status: 401 }
            )
        };
    }

    const token = authHeader.substring(7);

    try {
        const userToken = await jwtVerify<TokenPayload>(token, new TextEncoder().encode(process.env.JWT_SECRET));
        return {
            success: true,
            user: userToken.payload
        };
    } catch {
        return {
            success: false,
            error: Response.json(
                { success: false, error: "Invalid token." },
                { status: 401 }
            )
        };
    }
}
