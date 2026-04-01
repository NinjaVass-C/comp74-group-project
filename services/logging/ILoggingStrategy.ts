import type { LogSeverity } from "../../models/logging/LogSeverity";

/**
 * Interface for different strategies to log messages, i.e file, console, external service, etc.
 */
export interface ILoggingStrategy {
    log(message: string, severity?: LogSeverity): void;
}