import type { LogSeverity } from "../../models/logging/LogSeverity";

export interface ILoggingStrategy {
    log(message: string, severity?: LogSeverity): void;
}