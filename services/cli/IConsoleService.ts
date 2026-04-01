import type { LogSeverityType } from "../../models/logging/LogSeverity";

export interface IConsoleService {
    handle(input: string): void;
    log(message: string, severity?: LogSeverityType): void;
    start(): void;
}