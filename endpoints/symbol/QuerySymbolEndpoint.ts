import type { BunRequest } from "bun";
import { WebserverEndpoint } from "../WebserverEndpoint";
import YahooFinance from "yahoo-finance2/src/index.ts";
import { Endpoint } from "../../models/endpoints";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";

@Endpoint
export class QuerySymbolEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "Query for a symbol through yahoo finance",
        tags: ["Symbol"],

        query: {
            symbol: { type: "string", required: true },
        },
        responses: {
            200: {
                description: "Symbol found",
                body: {
                    quote: "object"
                }
            },
            400: { description: "Invalid body" },
            404: { description: "No symbol found" },
        },
        auth: false
    };
    override async get(request: BunRequest): Promise<Response> {
        const { symbol } = request.params;

        if (!symbol) {
            return ErrorResponse("Missing 'symbol' query parameter.", 400)
        }

        const yahooFinance = new YahooFinance();
        const quote = await yahooFinance.quote(symbol).catch((error) => {
            console.error(`Error fetching data for symbol ${symbol}:`, error);
            return null;
        });

        if (!quote) {
            return ErrorResponse(`No Data for symbol ${symbol}:`, 404);
        }

        return Promise.resolve(
            Response.json(
                { ...quote },
                { status: 200 }
            )
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: BunRequest) => Promise<Response>; }[] {
        return [
            {
                method: "GET",
                path: "/api/symbol/:symbol",
                handler: this.get.bind(this)
            },
        ];
    }

}