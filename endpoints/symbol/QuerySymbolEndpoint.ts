import type { BunRequest } from "bun";
import { WebserverEndpoint } from "../WebserverEndpoint";
import YahooFinance from "yahoo-finance2/src/index.ts";
import { Endpoint } from "../../models/endpoints";

@Endpoint
export class QuerySymbolEndpoint extends WebserverEndpoint {
    override async get(request: BunRequest): Promise<Response> {
        const { symbol } = request.params;

        if (!symbol) {
            return Promise.resolve(
                Response.json(
                    { error: "Missing 'symbol' query parameter" },
                    { status: 400 }
                )
            );
        }

        const yahooFinance = new YahooFinance();
        const quote = await yahooFinance.quote(symbol).catch((error) => {
            console.error(`Error fetching data for symbol ${symbol}:`, error);
            return null;
        });

        if (!quote) {
            return Promise.resolve(
                Response.json(
                    { error: `No data found for symbol: ${symbol}` },
                    { status: 404, }
                ),
            );
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