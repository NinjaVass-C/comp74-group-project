import type { ILoggingService } from "./ILoggingService";
import type { ILoggingStrategy } from "./ILoggingStrategy";

/**
 * The global logging service that manages multiple logging strategies.
 */
export class GlobalLoggingService implements ILoggingService {
    constructor(private strategies: ILoggingStrategy[] = []) { }

    addStrategy(strategy: ILoggingStrategy): void {
        this.strategies.push(strategy);
    }
    removeStrategy(strategy: ILoggingStrategy): void {
        this.strategies = this.strategies.filter(s => s !== strategy);
    }

    log(message: string, severity?: string): void {
        for (const strategy of this.strategies) {
            strategy.log(message, severity);
        }
    }

    logTo<T extends ILoggingStrategy>(message: string, severity: string, _strategyClass: new (...args: any[]) => T): void {
        const strategy = this.strategies.find(s => s instanceof _strategyClass);
        if (strategy) {
            strategy.log(message, severity);
        } else {
            console.warn(`Logging strategy not found: ${_strategyClass.name}`);
        }
    }
}