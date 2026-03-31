
/**
 * Defines the interface for a service that provides launch arguments to the application.
 * 
 * This service is responsible for parsing command-line arguments and making them accessible throughout the application.
 */
export interface ILaunchArgumentsProvider {
    initLaunchArguments(args: string[]): void;
    getArgument<T>(key: string): T | undefined;
}