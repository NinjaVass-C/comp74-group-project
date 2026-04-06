import type { BunRequest } from "bun";
import { WebserverEndpoint } from "../WebserverEndpoint";
import YahooFinance from "yahoo-finance2/src/index.ts";
import { Endpoint } from "../../models/endpoints";
import {ErrorResponse} from "../../utils/ErrorResponse.ts";

@Endpoint
export class QuerySymbolValueEndpoint extends WebserverEndpoint {
    override async get(request: BunRequest): Promise<Response> {
        const { symbol } = request.params;

        if (!symbol) {
            return ErrorResponse("Missing 'symbol' query parameter.", 400)
        }

        const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
        const quote = await yahooFinance.quote(symbol).catch((error) => {
            console.error(`Error fetching data for symbol ${symbol}:`, error);
            return null;
        });

        if (!quote) {
            return ErrorResponse("No data found for symbol: ${symbol}.", 404)
        }

        return Promise.resolve(
            Response.json(
                {
                    value: quote.regularMarketPrice,
                    currency: quote.currency,
                    timestamp: quote.regularMarketTime
                },
                { status: 200 }
            )
        );
    }

    override toBunRoute(): { method: string; path: string; handler: (request: BunRequest) => Promise<Response>; }[] {
        return [
            {
                method: "GET",
                path: "/api/symbol/:symbol/value",
                handler: this.get.bind(this)
            },
        ];
    }

}