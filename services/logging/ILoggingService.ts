import type { ILoggingStrategy } from "./ILoggingStrategy";

export interface ILoggingService {
    addStrategy(strategy: ILoggingStrategy): void;
    removeStrategy(strategy: ILoggingStrategy): void;
    log(message: string, severity?: string): void;
    logTo<T extends ILoggingStrategy>(message: string, severity: string, _strategyClass: new (...args: any[]) => T): void;
}