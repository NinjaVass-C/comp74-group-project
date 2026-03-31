
export interface ILaunchArgumentsProvider {
    initLaunchArguments(args: string[]): void;
    getArgument<T>(key: string): T | undefined;
}