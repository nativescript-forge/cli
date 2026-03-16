"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./utils/theme");
const commander_1 = require("commander");
const create_1 = require("./commands/create");
const run_1 = require("./commands/run");
const build_1 = require("./commands/build");
const resources_1 = require("./commands/resources");
const proxy_1 = require("./commands/proxy");
const doctor_1 = require("./commands/doctor");
const info_1 = require("./commands/info");
const menu_1 = require("./commands/menu");
const picocolors_1 = __importDefault(require("picocolors"));
const child_process_1 = require("child_process");
const program = new commander_1.Command();
const ASCII_ART = `
  _   _  ____  _____ 
 | \\ | |/ ___||  ___|
 |  \\| |\\___ \\| |_   
 | |\\  | ___) |  _|  
 |_| \\_|____/ |_|    
`;
const FORGE_COLOR = (text) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;
const pkg = require("../package.json");
program
    .name("nsf")
    .description("An opinionated interactive wrapper around the NativeScript CLI")
    .version(pkg.version);
program.addHelpText("before", FORGE_COLOR(ASCII_ART));
program.addHelpText("before", picocolors_1.default.white(" NativeScript Forge CLI ") +
    FORGE_COLOR(`version ${pkg.version}\n`));
program
    .command("create [appName]")
    .description("Create a new NativeScript project with interactive prompts")
    .action(async (appName) => {
    await (0, create_1.createCommand)(appName);
});
program
    .command("run")
    .description("Run the project on a device or emulator")
    .action(async () => {
    await (0, run_1.runCommand)();
});
program
    .command("build")
    .description("Build the project for the selected platform")
    .action(async () => {
    await (0, build_1.buildCommand)();
});
program
    .command("resources")
    .description("Generate application resources such as icons and splash screens")
    .action(async () => {
    await (0, resources_1.resourcesCommand)();
});
program
    .command("proxy")
    .description("Configure and manage proxy settings")
    .action(async () => {
    await (0, proxy_1.proxyCommand)();
});
program
    .command("doctor")
    .description("Check the environment for potential issues")
    .action(async () => {
    await (0, doctor_1.doctorCommand)();
});
program
    .command("info")
    .description("Display information about the current environment")
    .action(async () => {
    await (0, info_1.infoCommand)();
});
program
    .command("menu")
    .description("Show the main menu")
    .action(async () => {
    await (0, menu_1.menuCommand)();
});
program.on("command:*", (operands) => {
    const args = [...operands, ...program.args.slice(operands.length)];
    (0, child_process_1.spawn)("ns", args, { stdio: "inherit", shell: true });
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
