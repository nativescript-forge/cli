import {
  intro,
  outro,
  select,
  text,
  spinner,
  isCancel,
  cancel,
  confirm,
} from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";

async function fetchVersions(): Promise<string[]> {
  try {
    const res = await fetch("https://registry.npmjs.org/nativescript");
    if (!res.ok) throw new Error("Failed to fetch versions from npm registry.");
    const data = (await res.json()) as any;
    const versions = Object.keys(data.versions || {});

    // Filter to retain only valid stable semver patterns (e.g. 8.0.0, not 8.0.0-rc.1)
    const stableVersions = versions
      .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
      .sort((a, b) => {
        const partsA = a.split(".").map(Number);
        const partsB = b.split(".").map(Number);
        for (let i = 0; i < 3; i++) {
          if (partsA[i] !== partsB[i]) {
            return partsB[i] - partsA[i]; // descending order
          }
        }
        return 0;
      });
    return stableVersions.slice(0, 10);
  } catch (error) {
    return [];
  }
}

export async function updateCommand() {
  intro(BG_FORGE_COLOR(" nsf update "));

  console.log(
    `${pc.yellow("◇")} ${pc.bold("Information:")}\n` +
      `  This command will update the following core packages to their latest versions:\n` +
      `  - ${pc.cyan("@nativescript/core")}\n` +
      `  - ${pc.cyan("@nativescript/webpack")}\n` +
      `  - ${pc.cyan("@nativescript/types")} (if installed)\n` +
      `  - ${pc.cyan("@nativescript/ios")} (if installed)\n` +
      `  - ${pc.cyan("@nativescript/android")} (if installed)\n`,
  );

  const target = await select({
    message: "Select update target:",
    options: [
      {
        value: "latest",
        label: pc.bold("Latest Stable"),
        hint: pc.dim("Update dependencies to latest stable version"),
      },
      {
        value: "next",
        label: pc.bold("Next Release"),
        hint: pc.dim(
          "Update dependencies to latest pre-release/preview version",
        ),
      },
      {
        value: "version",
        label: pc.bold("Specific Version"),
        hint: pc.dim("Specify a specific version number to update to"),
      },
    ],
  });

  if (isCancel(target)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const args: string[] = ["update"];
  let versionStr = "";

  if (target === "next") {
    args.push("next");
  } else if (target === "version") {
    const s_fetch = spinner();
    s_fetch.start("Fetching versions from npm registry...");
    const npmVersions = await fetchVersions();
    s_fetch.stop("Versions fetched successfully.");

    let selectedVersion: any = "manual";

    if (npmVersions.length > 0) {
      selectedVersion = await select({
        message: "Select a version to update to:",
        options: [
          ...npmVersions.map((v) => ({
            value: v,
            label: v,
          })),
          {
            value: "manual",
            label: pc.bold("Enter manually..."),
            hint: pc.dim("Type a custom version number"),
          },
        ],
      });

      if (isCancel(selectedVersion)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }
    }

    if (selectedVersion === "manual") {
      const versionInput = await text({
        message: "Enter the NativeScript version (e.g., 8.0.0):",
        placeholder: "8.0.0",
        validate: (value) => {
          if (!value.trim()) return "Version is required";
        },
      });

      if (isCancel(versionInput)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }
      versionStr = versionInput.trim();
    } else {
      versionStr = selectedVersion;
    }
    args.push(versionStr);
  }

  const s = spinner();
  const cmdLine = `ns ${args.join(" ")}`;
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", args, {
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
    child.on("close", async (code: number | null) => {
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
      } else {
        console.log(pc.green("Update completed successfully!"));
      }

      const runClean = await confirm({
        message:
          "Would you like to run 'ns clean' now? (Recommended after updating)",
        initialValue: true,
      });

      if (runClean && !isCancel(runClean)) {
        s.start("Running ns clean...");
        const cleanChild = spawn("ns", ["clean"], {
          stdio: "ignore",
          shell: true,
        });
        const cleanCleanup = setupProcessCleanup(cleanChild);
        await new Promise<void>((res) => {
          cleanChild.on("close", () => {
            cleanCleanup();
            res();
          });
        });
        s.stop("Project cleaned!");
      }

      outro(UI_STRINGS.outro);
      process.exit(code || 0);
    });
  });
}
