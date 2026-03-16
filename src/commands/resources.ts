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
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";

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
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const imagePath = await text({
    message:
      "Enter the real path of the image (Recommended size: 1080x1080 pixels):",
    placeholder: "C:\\...\\myicon.png",
    validate(value: string) {
      if (value.trim().length === 0) return "Image path is required!";
    },
  });

  if (isCancel(imagePath)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  let background: string | symbol = "";

  if (resourceType === "splashes") {
    background = await text({
      message: "Enter background color code (Optional, e.g., #000000):",
      placeholder: "#000000",
    });

    if (isCancel(background)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }
  }

  const displayResourceType =
    resourceType === "icons" ? "Icon" : "Splashscreen";

  const args = [
    "resources",
    "generate",
    resourceType as string,
    imagePath as string,
  ];

  if (
    resourceType === "splashes" &&
    typeof background === "string" &&
    background.trim().length > 0
  ) {
    args.push("--background", background.trim());
  }

  const s = spinner();
  s.start(`Preparing ${pc.cyan(displayResourceType)}...`);
  s.stop(`Executing: ${pc.green(`ns ${args.join(" ")}`)}`);

  try {
    const child = spawn("ns", args, { stdio: "inherit", shell: true });

    await new Promise((resolve, reject) => {
      child.on("close", (code: number | null) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Exit code: ${code}`));
        }
      });
    });

    let summaryText =
      `${pc.white("Summary:")}\n` +
      `${pc.dim("  Resource Type: ")} ${pc.cyan(resourceType === "icons" ? "Icon" : "Splashscreen")}\n` +
      `${pc.dim("  Source Image:  ")} ${pc.cyan(imagePath)}`;

    if (
      resourceType === "splashes" &&
      typeof background === "string" &&
      background.trim().length > 0
    ) {
      summaryText += `\n${pc.dim("  Background:    ")} ${pc.cyan(background)}`;
    }

    note(summaryText, "Success");

    outro(UI_STRINGS.outro);
  } catch (error: any) {
    cancel(UI_STRINGS.error(error.message));
    process.exit(1);
  }
}
