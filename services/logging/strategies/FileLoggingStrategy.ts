import type { BunFile } from "bun";
import type { LogSeverityType } from "../../../models/logging/LogSeverity";
import type { ILoggingStrategy } from "../ILoggingStrategy";

/**
 * File output strategy for logging messages to a specified file path
 */
export class FileLoggingStrategy implements ILoggingStrategy {
    private filePath: string;
    private bunFile: BunFile;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.bunFile = Bun.file(this.filePath);
    }

    log(message: string, logSeverity: LogSeverityType = "info"): void {
        this.bunFile.write(`[${new Date().toLocaleString()}] [${logSeverity.toUpperCase()}] ${message}\n`);
    }
}