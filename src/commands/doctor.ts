import { intro, outro, spinner, cancel } from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";

export async function doctorCommand() {
  intro(BG_FORGE_COLOR(" nsf doctor "));

  const s = spinner();
  const cmdLine = "ns doctor";
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", ["doctor"], {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });

  let fullOutput = "";

  child.stdout.on("data", (data) => {
    fullOutput += data.toString();
  });

  child.stderr.on("data", (data) => {
    fullOutput += data.toString();
  });

  await new Promise((resolve) => {
    child.on("close", (code: number | null) => {
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
