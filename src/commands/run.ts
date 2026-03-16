import {
  intro,
  outro,
  select,
  text,
  spinner,
  isCancel,
  cancel,
  multiselect,
  note,
} from "@clack/prompts";
import { spawn, execSync } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";

async function getAvailableDevices(
  platform: string,
): Promise<{ label: string; value: string; hint?: string }[]> {
  try {
    const output = execSync(`ns device ${platform} --available-devices`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const lines = output.split("\n");
    const devices: { label: string; value: string; hint?: string }[] = [];

    for (const line of lines) {
      if (
        line.includes("│") &&
        !line.includes("Device Name") &&
        !line.includes("────")
      ) {
        const parts = line
          .split("│")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        if (parts.length >= 4) {
          const name = parts[1];
          const identifier = parts[3];
          const type = parts[4];
          devices.push({
            label: name,
            value: identifier,
            hint: `${type} (${identifier})`,
          });
        }
      }
    }
    return devices;
  } catch (error) {
    return [];
  }
}

export async function runCommand() {
  intro(BG_FORGE_COLOR(" nsf run "));

  const platform = await select({
    message: "Select platform:",
    options: [
      {
        value: "android",
        label: "Android",
        hint: "Run on Android devices/emulators",
      },
      { value: "ios", label: "iOS", hint: "Run on iOS devices/simulators" },
      {
        value: "visionos",
        label: "VisionOS",
        hint: "Run on VisionOS simulators",
      },
    ],
  });

  if (isCancel(platform)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const selectedOptions = (await multiselect({
    message: "Select options (Space to select, Enter to confirm):",
    options: [
      {
        value: "release",
        label: "Release build",
        hint: "Produces a production build with optimizations",
      },
      {
        value: "justlaunch",
        label: "Just launch",
        hint: "Launch app without printing output to console",
      },
      {
        value: "device",
        label: "Select device",
        hint: "Pick from available devices/emulators",
      },
      {
        value: "no-hmr",
        label: "Disable HMR",
        hint: "Disable Hot Module Replacement (restarts app on change)",
      },
      {
        value: "aab",
        label: "Android App Bundle",
        hint: "Produces .aab instead of .apk for Android",
      },
      {
        value: "force",
        label: "Force check",
        hint: "Skips compatibility checks and forces dependency install",
      },
      {
        value: "env",
        label: "Environment flags",
        hint: "Pass custom flags like --env.aot, --env.uglify, etc.",
      },
    ],
    required: false,
  })) as string[];

  if (isCancel(selectedOptions)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const args: string[] = ["run", platform as string];
  let deviceId = "";
  let envFlags: string[] = [];

  for (const option of selectedOptions) {
    if (option === "device") {
      let stayInDeviceSelection = true;

      while (stayInDeviceSelection) {
        const sFetch = spinner();
        sFetch.start(
          `Fetching available ${pc.cyan(platform as string)} devices...`,
        );
        const availableDevices = await getAvailableDevices(platform as string);
        sFetch.stop(`Fetched ${availableDevices.length} devices.`);

        const deviceOptions = [
          ...availableDevices,
          {
            value: "retry",
            label: "🔄 Check Again",
            hint: "Re-scan for connected devices/emulators",
          },
          {
            value: "none",
            label: "➡️ Continue without selecting",
            hint: "Let NativeScript CLI handle device selection/startup",
          },
          {
            value: "manual",
            label: "⌨️ Input ID manually...",
            hint: "Enter a custom Device Identifier",
          },
        ];

        deviceId = (await select({
          message: "Choose device:",
          options: deviceOptions,
        })) as string;

        if (isCancel(deviceId)) {
          cancel(UI_STRINGS.cancel);
          process.exit(0);
        }

        if (deviceId === "retry") {
          continue;
        }

        if (deviceId === "none") {
          deviceId = "";
          stayInDeviceSelection = false;
        } else if (deviceId === "manual") {
          deviceId = (await text({
            message: "Enter Device ID:",
            placeholder: "emulator-5554",
            validate(value: string) {
              if (value.length === 0) return `Device ID is required!`;
            },
          })) as string;

          if (isCancel(deviceId)) {
            cancel(UI_STRINGS.cancel);
            process.exit(0);
          }
          stayInDeviceSelection = false;
        } else {
          stayInDeviceSelection = false;
        }
      }

      if (deviceId) {
        args.push("--device", deviceId);
      }
    } else if (option === "env") {
      const envInput = (await text({
        message: "Enter Environment flags (comma separated):",
        placeholder: "aot, snapshot, uglify, report",
      })) as string;

      if (isCancel(envInput)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }

      if (envInput.trim()) {
        envFlags = envInput.split(",").map((t) => t.trim());
        envFlags.forEach((flag) => {
          args.push(`--env.${flag}`);
        });
      }
    } else {
      args.push(`--${option}`);
    }
  }

  const s = spinner();
  const cmdLine = `ns ${args.join(" ")}`;
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", args, { stdio: ["inherit", "pipe", "inherit"], shell: true });

  let outputStarted = false;

  child.stdout.on("data", (data) => {
    if (!outputStarted) {
      s.stop(`Executing: ${pc.green(cmdLine)}`);
      console.log(`\n${pc.yellow("◇")} ${pc.bold("Command Output:")}`);
      outputStarted = true;
    }
    process.stdout.write(data);
  });

  await new Promise((resolve) => {
    child.on("close", (code: number | null) => {
      if (!outputStarted) {
        s.stop(`Executing: ${pc.green(cmdLine)}`);
      } else {
        console.log(); // Blank line for spacing
      }
      
      if (code !== 0 && code !== null) {
        console.log(pc.red(`Command exited with code ${code}`));
      } else {
        note(
          `${pc.white("Summary:")}\n` +
          `${pc.dim("  Platform: ")} ${pc.cyan(platform as string)}\n` +
          `${pc.dim("  Options:  ")} ${pc.cyan(selectedOptions.join(", ") || "Default")}`,
          "Run Finished"
        );
      }
      outro(UI_STRINGS.outro);
      process.exit(code || 0);
    });
  });
}
