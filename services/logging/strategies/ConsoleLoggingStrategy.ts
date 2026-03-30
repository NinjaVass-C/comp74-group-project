import type { BunFile } from "bun";
import type { ILoggingStrategy } from "../ILoggingStrategy";
import { LogSeverity, type LogSeverityType } from "../../../models/logging/LogSeverity";

export class ConsoleLoggingStrategy implements ILoggingStrategy {
    log(message: string, severity: LogSeverityType = LogSeverity.INFO): void {
        console.log(`[${new Date().toLocaleString()}] [${severity.toUpperCase()}] ${message}`);
    }
}