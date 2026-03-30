
export interface IWebserverService {
    start(port: number): void;
    stop(): void;
}