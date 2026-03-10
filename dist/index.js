"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const create_1 = require("./commands/create");
const picocolors_1 = __importDefault(require("picocolors"));
const program = new commander_1.Command();
const ASCII_ART = `
  _   _  ____  _____ 
 | \\ | |/ ___||  ___|
 |  \\| |\\___ \\| |_   
 | |\\  | ___) |  _|  
 |_| \\_|____/ |_|    
`;
program
    .name("nsf")
    .description("An opinionated interactive wrapper around the NativeScript CLI")
    .version("1.0.0");
program.addHelpText("before", picocolors_1.default.cyan(ASCII_ART));
program.addHelpText("before", picocolors_1.default.white(" NativeScript Forge CLI ") + picocolors_1.default.green("version 1.0.0\n"));
program
    .command("create")
    .description("Create a new NativeScript project with interactive prompts")
    .action(async () => {
    await (0, create_1.createCommand)();
});
program.configureHelp({
    // commandUsage: (command) => pc.yellow("Usage: ") + command.usage(),
    subcommandTerm: (cmd) => picocolors_1.default.cyan(cmd.name()),
    subcommandDescription: (cmd) => cmd.description(),
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
