import { Command } from "commander";
import { createCommand } from "./commands/create";
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

program
  .name("nsf")
  .description("An opinionated interactive wrapper around the NativeScript CLI")
  .version("1.0.0");

program.addHelpText("before", pc.cyan(ASCII_ART));
program.addHelpText(
  "before",
  pc.white(" NativeScript Forge CLI ") + pc.green("version 1.0.0\n"),
);

program
  .command("create [appName]")
  .description("Create a new NativeScript project with interactive prompts")
  .action(async (appName) => {
    await createCommand(appName);
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
