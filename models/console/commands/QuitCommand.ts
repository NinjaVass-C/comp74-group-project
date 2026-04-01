import type { IConsoleService } from "../../../services/cli/IConsoleService";
import type { ICommand } from "./ICommand";

export default class QuitCommand implements ICommand {
    name: string = "quit";
    description: string = "Exits the console application.";

    execute(console: IConsoleService, args: string[]): void {
        console.log("Application is exiting...");
        process.exit(0);
    }

}