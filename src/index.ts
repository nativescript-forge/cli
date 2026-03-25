import "./utils/theme";
import { Command } from "commander";
import { createCommand } from "./commands/create";
import { runCommand } from "./commands/run";
import { buildCommand } from "./commands/build";
import { resourcesCommand } from "./commands/resources";
import { proxyCommand } from "./commands/proxy";
import { doctorCommand } from "./commands/doctor";
import { infoCommand } from "./commands/info";
import { pluginCommand } from "./commands/plugin";
import { menuCommand } from "./commands/menu";
import { debugCommand } from "./commands/debug";
import pc from "picocolors";
import { spawn } from "child_process";
import { setupProcessCleanup } from "./utils/process";

const program = new Command();

const ASCII_ART = `
  _   _  ____  _____ 
 | \\ | |/ ___||  ___|
 |  \\| |\\___ \\| |_   
 | |\\  | ___) |  _|  
 |_| \\_|____/ |_|    
`;

const FORGE_COLOR = (text: string) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;

import pkg from "../package.json";

program
  .name("nsf")
  .description("An opinionated interactive wrapper around the NativeScript CLI")
  .version(pkg.version);

program.addHelpText("before", FORGE_COLOR(ASCII_ART));
program.addHelpText(
  "before",
  pc.white(" NativeScript Forge CLI ") +
    FORGE_COLOR(`version ${pkg.version}\n`),
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
  .command("debug")
  .description("Debug the project on a device or emulator")
  .action(async () => {
    await debugCommand();
  });

program
  .command("build")
  .description("Build the project for the selected platform")
  .action(async () => {
    await buildCommand();
  });

program
  .command("resources")
  .description(
    "Generate application resources such as icons and splash screens",
  )
  .action(async () => {
    await resourcesCommand();
  });

program
  .command("plugin")
  .description("Manage project plugins (add, remove, update, build, create)")
  .action(async () => {
    await pluginCommand();
  });

program
  .command("proxy")
  .description("Configure and manage proxy settings")
  .action(async () => {
    await proxyCommand();
  });

program
  .command("doctor")
  .description("Check the environment for potential issues")
  .action(async () => {
    await doctorCommand();
  });

program
  .command("info")
  .description("Display information about the current environment")
  .action(async () => {
    await infoCommand();
  });

program
  .command("menu")
  .description("Show the main menu")
  .action(async () => {
    await menuCommand();
  });

program.on("command:*", (operands) => {
  const args = [...operands, ...program.args.slice(operands.length)];
  const child = spawn("ns", args, { stdio: "inherit", shell: true });
  setupProcessCleanup(child);
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
