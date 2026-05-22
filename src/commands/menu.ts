import { intro, select, isCancel, cancel } from "@clack/prompts";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import pc from "picocolors";
import { createCommand } from "./create";
import { runCommand } from "./run";
import { debugCommand } from "./debug";
import { buildCommand } from "./build";
import { resourcesCommand } from "./resources";
import { proxyCommand } from "./proxy";
import { doctorCommand } from "./doctor";
import { infoCommand } from "./info";
import { pluginCommand } from "./plugin";
import { nativeCommand } from "./native";
import { pmCommand } from "./pm";
import { bundlerCommand } from "./bundler";
import pkg from "../../package.json";

export async function menuCommand() {
  while (true) {
    intro(
      `${BG_FORGE_COLOR(" NativeScript Forge ")} ${pc.dim(`v${pkg.version}`)}`,
    );

    const command = await select({
      message: "Select a command to run:",
      options: [
        {
          value: "build",
          label: pc.bold("Build"),
          hint: pc.dim("Build the project for Android/iOS"),
        },
        {
          value: "bundler",
          label: pc.bold("Bundler"),
          hint: pc.dim("Switch between Webpack and Vite"),
        },
        {
          value: "create",
          label: pc.bold("Create"),
          hint: pc.dim("Create a new NativeScript project"),
        },
        {
          value: "debug",
          label: pc.bold("Debug"),
          hint: pc.dim("Debug the project on a device/emulator"),
        },
        {
          value: "doctor",
          label: pc.bold("Doctor"),
          hint: pc.dim("Check environment health"),
        },
        {
          value: "info",
          label: pc.bold("Info"),
          hint: pc.dim("System and environment information"),
        },
        {
          value: "native",
          label: pc.bold("Native"),
          hint: pc.dim("Manage platform language classes (Swift, Kotlin, etc.)"),
        },
        {
          value: "plugin",
          label: pc.bold("Plugin"),
          hint: pc.dim("Manage project plugins (add, remove, etc.)"),
        },
        {
          value: "pm",
          label: pc.bold("Package Manager"),
          hint: pc.dim("Manage default package manager"),
        },
        {
          value: "proxy",
          label: pc.bold("Proxy"),
          hint: pc.dim("Manage proxy settings"),
        },
        {
          value: "resources",
          label: pc.bold("Resources"),
          hint: pc.dim("Generate icons and splash screens"),
        },
        {
          value: "run",
          label: pc.bold("Run"),
          hint: pc.dim("Run the project on a device/emulator"),
        },
      ],
    });

    if (isCancel(command)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }

    let result: any;
    switch (command) {
      case "build":
        result = await buildCommand();
        break;
      case "bundler":
        result = await bundlerCommand();
        break;
      case "create":
        result = await createCommand();
        break;
      case "debug":
        result = await debugCommand();
        break;
      case "doctor":
        result = await doctorCommand();
        break;
      case "info":
        result = await infoCommand();
        break;
      case "native":
        result = await nativeCommand();
        break;
      case "pm":
        result = await pmCommand();
        break;
      case "plugin":
        result = await pluginCommand();
        break;
      case "proxy":
        result = await proxyCommand();
        break;
      case "resources":
        result = await resourcesCommand();
        break;
      case "run":
        result = await runCommand();
        break;
    }

    if (result === "back") {
      continue;
    }
    break;
  }
}
