import type { ILoggingStrategy } from "../ILoggingStrategy";
import { LogSeverity, type LogSeverityType } from "../../../models/logging/LogSeverity";

/**
 * Console output strategy for logging messages
 */
export class ConsoleLoggingStrategy implements ILoggingStrategy {
    log(message: string, severity: LogSeverityType = LogSeverity.INFO): void {
        const timestamp = new Date().toLocaleString();
        const formattedMessage = `[${timestamp}] [${severity.toUpperCase()}] ${message}`;

        process.stdout.write(`\r\x1b[K${formattedMessage}\n `);
    }
}