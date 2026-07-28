import {
  intro,
  outro,
  confirm,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";

export async function migrateCommand() {
  intro(BG_FORGE_COLOR(" nsf migrate "));

  console.log(
    `${pc.yellow("◇")} ${pc.bold("Warning:")}\n` +
      `  This command will migrate your project structure and dependencies\n` +
      `  to match the currently installed NativeScript CLI version.\n` +
      `  It requires a clean Git environment because it modifies configuration files.\n`,
  );

  const proceed = await confirm({
    message: "Do you want to proceed with the migration?",
    initialValue: false,
  });

  if (isCancel(proceed) || !proceed) {
    cancel("Migration cancelled.");
    process.exit(0);
  }

  const s = spinner();
  const cmdLine = "ns migrate";
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", ["migrate"], {
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
        console.log(pc.green("Migration completed successfully!"));
      }

      const runClean = await confirm({
        message:
          "Would you like to run 'ns clean' now? (Recommended after migration)",
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
