import {
  intro,
  outro,
  select,
  text,
  spinner,
  note,
  isCancel,
  cancel,
} from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";
import { TEMPLATE_MAPPING } from "../utils/constants";

export async function createCommand() {
  intro(pc.bgCyan(pc.black(" nsf create ")));

  const appName = await text({
    message: "What is your application name?",
    placeholder: "my-cool-app",
    validate(value: string) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  if (isCancel(appName)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const platformKey = await select({
    message: "Select platform:",
    options: Object.entries(TEMPLATE_MAPPING).map(([key, platform]) => ({
      value: key,
      label: platform.name,
    })),
  });

  if (isCancel(platformKey)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const platform = TEMPLATE_MAPPING[platformKey as string];

  // Only show flavors that have templates
  const flavorOptions = platform.flavors
    .filter((f) => f.templates.length > 0)
    .map((f) => ({
      value: f.name,
      label: f.name,
    }));

  if (flavorOptions.length === 0) {
    cancel(`No templates available for ${platform.name}.`);
    process.exit(0);
  }

  const flavorName = await select({
    message: "Select flavor:",
    options: flavorOptions,
  });

  if (isCancel(flavorName)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const flavor = platform.flavors.find((f) => f.name === flavorName);

  if (!flavor) {
    cancel("Invalid flavor selection.");
    process.exit(0);
  }

  const templateValue = await select({
    message: "Select template:",
    options: flavor.templates.map((t) => ({
      value: t.value,
      label: t.name,
    })),
  });

  if (isCancel(templateValue)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const platformLabel = platform.name;
  const flavorLabel = flavorName as string;
  const templateLabel =
    flavor.templates.find((t) => t.value === templateValue)?.name || "Default";

  const s = spinner();
  s.start(`Creating application ${pc.cyan(appName)}...`);

  try {
    const args = ["create", appName, "--template", templateValue as string];

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

    s.stop(`Application ${pc.green(appName)} created successfully!`);

    note(
      `${pc.white("Summary:")}\n` +
        `${pc.dim("  Platform: ")} ${pc.cyan(platformLabel)}\n` +
        `${pc.dim("  Flavor:   ")} ${pc.cyan(flavorLabel)}\n` +
        `${pc.dim("  Template: ")} ${pc.cyan(templateLabel)}\n\n` +
        `${pc.white("Next steps:")}\n` +
        pc.cyan(`  cd ${appName}\n`) +
        pc.cyan(`  ns run android|ios|visionos`),
      "Success",
    );

    outro(pc.bgCyan(pc.black(" NativeScript Forge CLI! ")));
  } catch (error: any) {
    s.stop("Failed to create application.");
    cancel(`Error: ${error.message}`);
    process.exit(1);
  }
}
