import { intro, select, isCancel, cancel } from "@clack/prompts";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import pc from "picocolors";
import { createCommand } from "./create";
import { runCommand } from "./run";
import { buildCommand } from "./build";
import { resourcesCommand } from "./resources";
import { proxyCommand } from "./proxy";
import { doctorCommand } from "./doctor";
import { infoCommand } from "./info";

export async function menuCommand() {
  const pkg = require("../../package.json");
  intro(
    `${BG_FORGE_COLOR(" NativeScript Forge ")} ${pc.dim(`v${pkg.version}`)}`,
  );

  const command = await select({
    message: "Select a command to run:",
    options: [
      {
        value: "create",
        label: pc.bold("Create"),
        hint: pc.dim("Create a new NativeScript project"),
      },
      {
        value: "run",
        label: pc.bold("Run"),
        hint: pc.dim("Run the project on a device/emulator"),
      },
      {
        value: "build",
        label: pc.bold("Build"),
        hint: pc.dim("Build the project for Android/iOS"),
      },
      {
        value: "resources",
        label: pc.bold("Resources"),
        hint: pc.dim("Generate icons and splash screens"),
      },
      {
        value: "proxy",
        label: pc.bold("Proxy"),
        hint: pc.dim("Manage proxy settings"),
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
    ],
  });

  if (isCancel(command)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  switch (command) {
    case "create":
      await createCommand();
      break;
    case "run":
      await runCommand();
      break;
    case "build":
      await buildCommand();
      break;
    case "resources":
      await resourcesCommand();
      break;
    case "proxy":
      await proxyCommand();
      break;
    case "doctor":
      await doctorCommand();
      break;
    case "info":
      await infoCommand();
      break;
  }
}
