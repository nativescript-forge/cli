import { Command } from "commander";
import { createCommand } from "./commands/create";
import { runCommand } from "./commands/run";
import { buildCommand } from "./commands/build";
import pc from "picocolors";
import { spawn } from "child_process";

const program = new Command();

const ASCII_ART = `
  _   _  ____  _____ 
 | \\ | |/ ___||  ___|
 |  \\| |\\___ \\| |_   
 | |\\  | ___) |  _|  
 |_| \\_|____/ |_|    
`;

const FORGE_COLOR = (text: string) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;

const pkg = require("../package.json");

program
  .name("nsf")
  .description("An opinionated interactive wrapper around the NativeScript CLI")
  .version(pkg.version);

program.addHelpText("before", FORGE_COLOR(ASCII_ART));
program.addHelpText(
  "before",
  pc.white(" NativeScript Forge CLI ") + FORGE_COLOR(`version ${pkg.version}\n`),
);

program
  .command("create [appName]")
  .description("Create a new NativeScript project with interactive prompts")
  .action(async (appName) => {
    await createCommand(appName);
  });

program
  .command("run")
  .description("Run the project on a device or emulator")
  .action(async () => {
    await runCommand();
  });

program
  .command("build")
  .description("Build the project for the selected platform")
  .action(async () => {
    await buildCommand();
  });

program.on("command:*", (operands) => {
  const args = [...operands, ...program.args.slice(operands.length)];
  spawn("ns", args, { stdio: "inherit", shell: true });
});

program.configureHelp({
  // commandUsage: (command) => pc.yellow("Usage: ") + command.usage(),
  subcommandTerm: (cmd) => pc.cyan(cmd.name()),
  subcommandDescription: (cmd) => cmd.description(),
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
