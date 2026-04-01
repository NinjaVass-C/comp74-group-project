import type { IConsoleService } from "../../../services/cli/IConsoleService";

export interface ICommand {
    name: string;
    description: string;
    execute(console: IConsoleService, args: string[]): void;
}