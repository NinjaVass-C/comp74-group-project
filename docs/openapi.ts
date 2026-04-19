// src/docs/openapi.ts
import { ENDPOINTS } from "../models/endpoints";

const resolveSchema = (value: any): any => {
    if (!value) return value;

    if (typeof value === "string") {
        return { type: value };
    }

    if (value.type === "array") {
        return {
            type: "array",
            items: resolveSchema(value.items)
        };
    }
    if (value.type && typeof value.type === "string") {
        return { type: value.type };
    }
    if (typeof value === "object" && !Array.isArray(value)) {
        return {
            type: "object",
            properties: Object.fromEntries(
                Object.entries(value).map(([k, v]) => [
                    k,
                    resolveSchema(v)
                ])
            )
        };
    }

    return value;
};

export function generateOpenApi() {
    const paths: any = {};

    for (const endpoint of ENDPOINTS) {
        const routes = endpoint.toBunRoute?.() ?? [];
        const meta = (endpoint.openapi) ?? {};

        for (const route of routes) {
            if (!paths[route.path]) paths[route.path] = {};

            const method = route.method.toLowerCase();

            paths[route.path][method] = {
                summary: meta.summary,
                tags: meta.tags,

                ...(meta.auth && {
                    security: [{ bearerAuth: [] }]
                }),

                ...(meta.body && {
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: meta.body.required,
                                    properties: meta.body.properties
                                }
                            }
                        }
                    }
                }),
                ...(meta.query && {
                    parameters: Object.entries(meta.query).map(([name, config]: any) => ({
                        name,
                        in: "query",
                        required: config.required ?? false,
                        schema: {
                            type: config.type,
                            default: config.default
                        }
                    }))
                }),

                responses: Object.fromEntries(
                    Object.entries(meta.responses ?? {}).map(([code, res]: any) => {
                        const response: any = {
                            description: res.description ?? "No description"
                        };

                        if (res.body) {
                            response.content = {
                                "application/json": {
                                    schema: resolveSchema(res.body)
                                }
                            };
                        }

                        return [code, response];
                    })
                )
            };
        }
    }

    return {
        openapi: "3.0.0",
        info: {
            title: "Crypto Trading API",
            version: "1.0.0"
        },
        paths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer"
                }
            }
        }
    };
}