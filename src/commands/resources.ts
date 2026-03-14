import {
  intro,
  outro,
  select,
  text,
  spinner,
  isCancel,
  cancel,
  note,
} from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";

const FORGE_COLOR = (text: string) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;
const BG_FORGE_COLOR = (text: string) => `\x1b[48;2;249;168;37m\x1b[30m${text}\x1b[0m`;

export async function resourcesCommand() {
  intro(BG_FORGE_COLOR(" nsf resources "));

  const resourceType = await select({
    message: "Select resource to generate:",
    options: [
      { value: "icons", label: "Icon" },
      { value: "splashes", label: "Splashscreen" },
    ],
  });

  if (isCancel(resourceType)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const imagePath = await text({
    message: "Enter the real path of the image (Recommended size: 1080x1080 pixels):",
    placeholder: "C:\\...\\myicon.png",
    validate(value: string) {
      if (value.trim().length === 0) return "Image path is required!";
    },
  });

  if (isCancel(imagePath)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  let background: string | symbol = "";

  if (resourceType === "splashes") {
    background = await text({
      message: "Enter background color code (Optional, e.g., #000000):",
      placeholder: "#000000",
    });

    if (isCancel(background)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
  }

  const displayResourceType = resourceType === "icons" ? "Icon" : "Splashscreen";

  const s = spinner();
  s.start(`Generating ${displayResourceType}...`);

  try {
    const args = ["resources", "generate", resourceType as string, imagePath as string];

    if (resourceType === "splashes" && typeof background === "string" && background.trim().length > 0) {
      args.push("--background", background.trim());
    }

    const child = spawn("ns", args, { stdio: "ignore", shell: true });

    await new Promise((resolve, reject) => {
      child.on("close", (code: number | null) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Exit code: ${code}`));
        }
      });
    });

    s.stop(`${pc.green(displayResourceType)} generated successfully!`);
    
    let summaryText = `${pc.white("Summary:")}\n` +
      `${pc.dim("  Resource Type: ")} ${pc.cyan(resourceType === "icons" ? "Icon" : "Splashscreen")}\n` +
      `${pc.dim("  Source Image:  ")} ${pc.cyan(imagePath)}`;

    if (resourceType === "splashes" && typeof background === "string" && background.trim().length > 0) {
      summaryText += `\n${pc.dim("  Background:    ")} ${pc.cyan(background)}`;
    }

    note(summaryText, "Success");

    outro(BG_FORGE_COLOR(" NativeScript Forge CLI! "));
  } catch (error: any) {
    s.stop(`Failed to generate ${displayResourceType}.`);
    cancel(`Error: ${error.message}`);
    process.exit(1);
  }
}
