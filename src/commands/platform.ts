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

type PlatformAction = "list" | "add" | "remove" | "update" | "clean";
const back = { value: "__back__", label: "Go Back" };
const targetPattern = /^(android|ios|visionos)(@[a-zA-Z0-9][a-zA-Z0-9.+-]*)?$/;

export async function platformCommand(
  selectedAction?: PlatformAction,
  selectedTarget?: string,
) {
  intro(
    BG_FORGE_COLOR(
      ` nsf platform${selectedAction ? ` ${selectedAction}` : ""} `,
    ),
  );
  for (;;) {
    const action =
      selectedAction ??
      (await select<{ value: string; label: string; hint?: string }[], string>({
        message: "Select platform operation:",
        options: [
          {
            value: "list",
            label: "List",
            hint: "Show project target platforms",
          },
          { value: "add", label: "Add", hint: "Add a target platform" },
          {
            value: "remove",
            label: "Remove",
            hint: "Remove a target platform and its runtime",
          },
          {
            value: "update",
            label: "Update",
            hint: "Update a platform runtime",
          },
          {
            value: "clean",
            label: "Clean",
            hint: "Remove and reinstall a platform",
          },
          { ...back, hint: "Return to main menu" },
        ],
      }));
    if (isCancel(action)) {
      cancel(UI_STRINGS.cancel);
      return "back";
    }
    if (action === "__back__") return "back";
    if (action === "list") {
      await executePlatform(["platform", "list"]);
      return;
    }

    const target =
      selectedTarget ??
      (await select<{ value: string; label: string; hint?: string }[], string>({
        message: "Select platform:",
        options: [
          { value: "android", label: "Android" },
          {
            value: "ios",
            label: "iOS",
            hint: "Apple development requires macOS",
          },
          {
            value: "visionos",
            label: "VisionOS",
            hint: "Requires macOS and a compatible NativeScript CLI",
          },
          { ...back, hint: "Return to platform operations" },
        ],
      }));
    if (isCancel(target)) {
      cancel(UI_STRINGS.cancel);
      return "back";
    }
    if (target === "__back__") {
      selectedAction = undefined;
      continue;
    }
    if (
      !targetPattern.test(target) ||
      (target.includes("@") && action !== "add" && action !== "update")
    ) {
      cancel(
        "Use android, ios, or visionos. Only add/update accept an optional @version.",
      );
      process.exitCode = 1;
      return;
    }

    let runtime = target;
    if ((action === "add" || action === "update") && !selectedTarget) {
      const source = await select<
        { value: string; label: string; hint?: string }[],
        string
      >({
        message: "Select runtime version:",
        options: [
          {
            value: "latest",
            label: "Latest Stable",
            hint: "Use the default runtime version",
          },
          {
            value: "next",
            label: "Next Release",
            hint: "Use the preview runtime",
          },
          {
            value: "version",
            label: "Specific Version",
            hint: "Enter a runtime version",
          },
          { ...back, hint: "Return to platform selection" },
        ],
      });
      if (isCancel(source)) {
        cancel(UI_STRINGS.cancel);
        return "back";
      }
      if (source === "__back__") {
        selectedAction = action as PlatformAction;
        continue;
      }
      if (source === "next") runtime += "@next";
      if (source === "version") {
        const version = await text({
          message: "Enter runtime version:",
          placeholder: "9.0.0",
          validate(value) {
            if (!/^[a-zA-Z0-9][a-zA-Z0-9.+-]*$/.test(value.trim()))
              return "Enter a version or tag, such as 9.0.0 or next.";
          },
        });
        if (isCancel(version)) {
          cancel(UI_STRINGS.cancel);
          return "back";
        }
        runtime += `@${version.trim()}`;
      }
    }
    await executePlatform(["platform", action, runtime]);
    return;
  }
}

export async function platformListCommand() {
  return platformCommand("list");
}

async function executePlatform(args: string[]) {
  const s = spinner();
  const cmdLine = `ns ${args.join(" ")}`;
  s.start(`Executing: ${pc.green(cmdLine)}`);
  await new Promise<void>((resolve) => {
    const child = spawn("ns", args, {
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
    });
    const cleanup = setupProcessCleanup(child);
    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.stderr.on("data", (data) => {
      output += data.toString();
    });
    let failedToStart = false;
    child.once("error", (error) => {
      failedToStart = true;
      cleanup();
      s.stop(`Executing: ${pc.green(cmdLine)}`);
      cancel(`Failed to execute ${cmdLine}: ${error.message}`);
      process.exitCode = 1;
      resolve();
    });
    child.once("close", (code, signal) => {
      if (failedToStart) return;
      cleanup();
      s.stop(`Executing: ${pc.green(cmdLine)}`);
      if (output.trim()) {
        console.log(`\n${pc.bold("Command Output:")}`);
        console.log(pc.cyan(output.trim()));
        console.log();
      }
      if (code === 0) {
        outro(UI_STRINGS.outro);
      } else {
        cancel(
          signal
            ? `Command terminated by ${signal}`
            : `Command exited with code ${code ?? 1}`,
        );
        process.exitCode = code ?? 1;
      }
      resolve();
    });
  });
}
