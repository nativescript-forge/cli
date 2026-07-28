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

export async function cleanCommand() {
  intro(BG_FORGE_COLOR(" nsf clean "));

  console.log(
    `${pc.yellow("◇")} ${pc.bold("Information:")}\n` +
      `  This command cleans up generated directories (platforms, hooks, node_modules)\n` +
      `  to resolve build issues and ensure a fresh compilation state.\n`,
  );

  const proceed = await confirm({
    message: "Do you want to run 'ns clean' now?",
    initialValue: true,
  });

  if (isCancel(proceed) || !proceed) {
    cancel("Clean operation cancelled.");
    process.exit(0);
  }

  const s = spinner();
  const cmdLine = "ns clean";
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", ["clean"], {
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
        console.log(pc.green("Project cleaned successfully!"));
      }

      outro(UI_STRINGS.outro);
      process.exit(code || 0);
    });
  });
}
