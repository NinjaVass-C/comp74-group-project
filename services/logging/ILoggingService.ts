import type { LogSeverityType } from "../../models/logging/LogSeverity";
import type { ILoggingStrategy } from "./ILoggingStrategy";

/**
 * A logging service that manages multiple logging strategies. It allows adding and removing strategies, logging messages with a specified severity, and directing logs to specific strategies as needed. This service serves as a central point for logging throughout the application, enabling flexible and extensible logging capabilities.
 */
export interface ILoggingService {
    /**
     * Adds a new logging strategy to the service. When a message is logged, it will be processed by all registered strategies, including the newly added one. This allows for dynamic extension of logging capabilities at runtime.
     * @param {ILoggingStrategy} strategy 
     */
    addStrategy(strategy: ILoggingStrategy): void;

    /**
     * Removes an existing logging strategy from the service. After removal, the specified strategy will no longer receive log messages. This allows for dynamic modification of logging behavior at runtime, enabling or disabling certain logging outputs as needed.
     * @param {ILoggingStrategy} strategy
     */
    removeStrategy(strategy: ILoggingStrategy): void;

    /**
     * Logs a message with an optional severity level. This message is then processed by all registered logging strategies.
     * @param {string} message - The message to be logged.
     * @param {LogSeverityType} severity - An optional severity level for the log message, which can be used by logging strategies to determine how to handle the message (e.g., filtering, formatting).
     */
    log(message: string, severity?: LogSeverityType): void;

    /**
     * Logs a message with a specified severity level to a specific logging strategy. This allows for targeted logging, where certain messages can be directed to specific outputs (e.g., console, file) based on their content or severity.
     * @param {string} message - The message to be logged.
     * @param {LogSeverityType} severity - The severity level for the log message, which can be used by the specified logging strategy to determine how to handle the message.
     * @param {new (...args: any[]) => T} _strategyClass - The class of the logging strategy to which the message should be directed. The service will look for an instance of this strategy among the registered strategies and log the message to it if found.
     */
    logTo<T extends ILoggingStrategy>(message: string, severity: LogSeverityType, _strategyClass: new (...args: any[]) => T): void;
}