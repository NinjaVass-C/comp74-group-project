import type { BunRequest } from "bun";
import { WebserverEndpoint } from "../WebserverEndpoint";
import YahooFinance from "yahoo-finance2/src/index.ts";

export class QuerySymbolValueEndpoint extends WebserverEndpoint {
    override async get(request: BunRequest): Promise<Response> {
        const { symbol } = request.params;

        if (!symbol) {
            return Promise.resolve(
                new Response(
                    JSON.stringify({
                        error: "Missing 'symbol' query parameter"
                    }),
                    {  
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
            );
        }

        const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
        const quote = await yahooFinance.quote(symbol).catch((error) => {
            console.error(`Error fetching data for symbol ${symbol}:`, error);
            return null;
        });

        if (!quote) {
            return Promise.resolve(
                new Response(
                    JSON.stringify({
                        error: `No data found for symbol: ${symbol}`
                    }),
                    {
                        status: 404,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
            );
        }

        return Promise.resolve(
            new Response(
                JSON.stringify({
                    value: quote.regularMarketPrice,
                    currency: quote.currency,
                    timestamp: quote.regularMarketTime
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
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