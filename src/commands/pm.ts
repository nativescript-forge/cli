import {
  intro,
  outro,
  select,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";
import { spawn, exec } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const checkPM = (pm: string): Promise<boolean> => {
  return new Promise((resolve) => {
    exec(`${pm} --version`, (error) => {
      resolve(!error);
    });
  });
};

export async function pmCommand() {
  intro(BG_FORGE_COLOR(" nsf pm "));

  const action = await select({
    message: "Select an action:",
    options: [
      {
        value: "get",
        label: pc.bold("Get"),
        hint: pc.dim("Get the current default package manager"),
      },
      {
        value: "set",
        label: pc.bold("Set"),
        hint: pc.dim("Set the default package manager"),
      },
    ],
  });

  if (isCancel(action)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  if (action === "get") {
    await pmGetCommand(false);
  } else {
    await pmSetCommand(false);
  }
}

export async function pmGetCommand(showIntro = true) {
  if (showIntro) {
    intro(BG_FORGE_COLOR(" nsf pm get "));
  }

  const s = spinner();
  const cmdLine = "ns package-manager get";
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", ["package-manager", "get"], {
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
        console.log(
          `\n${pc.yellow("◇")} ${pc.bold("Current Default Package Manager:")}`,
        );
        console.log(pc.cyan(result));
        console.log();
      }

      if (code !== 0 && code !== null) {
        console.log(pc.red(`Command exited with code ${code}`));
      }

      if (showIntro) {
        outro(UI_STRINGS.outro);
        process.exit(code || 0);
      } else {
        outro(UI_STRINGS.outro);
      }
    });
  });
}

export async function pmSetCommand(showIntro = true) {
  if (showIntro) {
    intro(BG_FORGE_COLOR(" nsf pm set "));
  }

  const s_scanning = spinner();
  s_scanning.start("Scanning available package managers...");

  const possiblePMs = ["npm", "yarn", "pnpm", "bun"];
  const availablePMs: string[] = [];

  for (const pm of possiblePMs) {
    s_scanning.message(`Checking for ${pc.cyan(pm)}...`);
    // Add a tiny delay to ensure the message is visible to the user
    await new Promise((resolve) => setTimeout(resolve, 300));
    const exists = await checkPM(pm);
    if (exists) {
      availablePMs.push(pm);
    }
  }

  s_scanning.stop(
    `Scanning complete. Found: ${pc.green(availablePMs.join(", "))}`,
  );

  if (availablePMs.length === 0) {
    console.log(pc.red("No package managers found on your system!"));
    if (showIntro) {
      outro(UI_STRINGS.outro);
      process.exit(1);
    }
    return;
  }

  const selectedPM = await select({
    message: "Select package manager to set as default:",
    options: availablePMs.map((pm) => ({
      value: pm,
      label: pm,
    })),
  });

  if (isCancel(selectedPM)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const s = spinner();
  const cmdLine = `ns package-manager set ${selectedPM}`;
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", ["package-manager", "set", selectedPM as string], {
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
      } else {
        console.log(
          pc.green(
            `Successfully set ${selectedPM} as default package manager!`,
          ),
        );

        if (selectedPM === "pnpm") {
          const npmrcPath = path.join(process.cwd(), ".npmrc");
          const lineToAdd = "node-linker=hoisted";

          if (existsSync(npmrcPath)) {
            let content = readFileSync(npmrcPath, "utf-8");
            if (!content.includes(lineToAdd)) {
              content = content.endsWith("\n")
                ? content + lineToAdd + "\n"
                : content + "\n" + lineToAdd + "\n";
              writeFileSync(npmrcPath, content);
              console.log(pc.cyan(`  Added "${lineToAdd}" to existing .npmrc`));
            }
          } else {
            writeFileSync(npmrcPath, lineToAdd + "\n");
            console.log(pc.cyan(`  Created .npmrc with "${lineToAdd}"`));
          }
        }
      }

      if (showIntro) {
        outro(UI_STRINGS.outro);
        process.exit(code || 0);
      } else {
        outro(UI_STRINGS.outro);
      }
    });
  });
}
