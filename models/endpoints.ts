import type { WebserverEndpoint } from "../endpoints/WebserverEndpoint";

/**
 * Source of truth for all registered endpoints.
 */
export const ENDPOINTS: Set<WebserverEndpoint> = new Set();

/**
 * Endpoint decorator to register webserver endpoints.
 * @param endpoint 
 */
export function Endpoint(endpoint: Function) {
    ENDPOINTS.add(new (endpoint as new () => WebserverEndpoint)());
}