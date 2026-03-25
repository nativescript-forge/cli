import {
  intro,
  outro,
  select,
  text,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";

export async function pluginCommand() {
  intro(BG_FORGE_COLOR(" nsf plugin "));

  const pluginCategory = await select({
    message: "Select plugin category:",
    options: [
      {
        value: "management",
        label: "Project Management",
        hint: "Manage project plugins (list, add, remove, update)",
      },
      {
        value: "development",
        label: "Plugin Development",
        hint: "Develop new plugins (build, create)",
      },
    ],
  });

  if (isCancel(pluginCategory)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  let pluginAction;

  if (pluginCategory === "management") {
    pluginAction = await select({
      message: "What would you like to do?",
      options: [
        {
          value: "list",
          label: "List plugins",
          hint: "Lists installed plugins",
        },
        {
          value: "add",
          label: "Add plugin",
          hint: "Installs a plugin and its dependencies",
        },
        {
          value: "remove",
          label: "Remove plugin",
          hint: "Uninstalls a plugin and its dependencies",
        },
        {
          value: "update",
          label: "Update plugin",
          hint: "Uninstalls and installs the plugin to update",
        },
      ],
    });
  } else {
    pluginAction = await select({
      message: "What would you like to do?",
      options: [
        {
          value: "build",
          label: "Build plugin",
          hint: "Builds the Android parts of a plugin",
        },
        {
          value: "create",
          label: "Create plugin",
          hint: "Creates a project for a new plugin",
        },
      ],
    });
  }

  if (isCancel(pluginAction)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const commandArgs: string[] = ["plugin"];
  let pluginName: string | symbol = "";

  if (
    pluginAction === "add" ||
    pluginAction === "remove" ||
    pluginAction === "update" ||
    pluginAction === "create"
  ) {
    pluginName = await text({
      message: `Enter plugin name to ${pluginAction}:`,
      placeholder:
        pluginAction === "create"
          ? "nativescript-my-plugin"
          : "nativescript-plugin-name",
      validate(value: string) {
        if (value.length === 0) return `Plugin name is required!`;
      },
    });

    if (isCancel(pluginName)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }

    commandArgs.push(pluginAction as string, pluginName as string);
  } else if (pluginAction === "build") {
    commandArgs.push("build");
  } else if (pluginAction === "list") {
    // ns plugin (without arguments) lists plugins
  }

  const s = spinner();
  const cmdLine = `ns ${commandArgs.join(" ")}`;
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", commandArgs, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });

  const cleanup = setupProcessCleanup(child);

  let fullOutput = "";

  child.stdout.on("data", (data) => {
    fullOutput += data.toString();
  });

  child.stderr.on("data", (data) => {
    fullOutput += data.toString();
  });

  await new Promise<void>((_resolve) => {
    child.on("close", (code: number | null) => {
      cleanup();
      s.stop(`Executing: ${pc.green(cmdLine)}`);

      const result = fullOutput.trim();
      if (result) {
        console.log(`\n${pc.yellow("◇")} ${pc.bold("Command Output:")}`);
        console.log(pc.cyan(result));
        console.log();
      }

      if (code !== 0 && code !== null) {
        console.log(pc.red(`Command exited with code ${code}`));
      }

      outro(UI_STRINGS.outro);
      process.exit(code || 0);
    });
  });
}
