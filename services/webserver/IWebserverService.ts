
/**
 * Interface for the webserver service, defining methods to start and stop the server.
 */
export interface IWebserverService {
    start(port: number): void;
    stop(): void;
}