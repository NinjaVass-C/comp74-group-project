import { WebserverEndpoint } from "../WebserverEndpoint.ts"
import { generateOpenApi } from "../../docs/openapi.ts";
import YAML from "yaml";
import {Endpoint} from "../../models/endpoints.ts";

@Endpoint
export class DocsEndpoint extends WebserverEndpoint {
    override openapi = {
        summary: "Endpoint for generating openapi swagger docs",
        tags: ["Documentation"],
        responses: {
            200: { description: "Operation Completed" },
        },
        auth: false
    };
    override async get(): Promise<Response> {
        const docs = generateOpenApi()
        const yaml = YAML.stringify(docs, {aliasDuplicateObjects: false});
        const path = './openapi.yaml';
        const file = Bun.file(path);
        if (!await file.exists()) {
            console.log("WRITING")
            await Bun.write(path, yaml)
        }
        return Response.json(docs);
    }

    override toBunRoute(): { method: string; path: string; handler: (request: Request) => Promise<Response>; }[] {
        return [
            {
                method: "GET",
                path: "/api/docs/openapi",
                handler: this.get.bind(this)
            }
        ];
    }
}