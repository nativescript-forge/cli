import {
  intro,
  outro,
  select,
  text,
  spinner,
  isCancel,
  cancel,
  multiselect,
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

export async function buildCommand() {
  intro(BG_FORGE_COLOR(" nsf build "));

  const platform = await select({
    message: "Select platform:",
    options: [
      { value: "android", label: "Android", hint: "Build for Android" },
    ],
  });

  if (isCancel(platform)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const preset = await select({
    message: "Select Build Preset:",
    options: [
      {
        value: "production",
        label: "PRODUCTION",
        hint: "Release build with Keystore signing",
      },
      {
        value: "development",
        label: "DEVELOPMENT",
        hint: "Debug build for testing",
      },
      { value: "custom", label: "CUSTOM", hint: "Select options manually" },
    ],
  });

  if (isCancel(preset)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const args: string[] = ["build", platform as string];

  if (preset === "production" || preset === "development") {
    // Common flags for presets
    args.push("--env.uglify");

    if (preset === "production") {
      args.push("--release");

      const keystorePath = await text({
        message: "Enter full path to keystore location:",
        placeholder: "C:\\...\\my-key.keystore",
        validate(value) {
          if (!value) return "Keystore path is required";
        },
      });
      if (isCancel(keystorePath)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }
      args.push("--key-store-path", keystorePath as string);

      const storePassword = await text({
        message: "Enter store password:",
        placeholder: "Ex: abc123",
        validate(value) {
          if (!value) return "Store password is required";
        },
      });
      if (isCancel(storePassword)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }
      args.push("--key-store-password", storePassword as string);

      const storeAlias = await text({
        message: "Enter store alias:",
        placeholder: "myalias",
        validate(value) {
          if (!value) return "Store alias is required";
        },
      });
      if (isCancel(storeAlias)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }
      args.push("--key-store-alias", storeAlias as string);

      const storeAliasPassword = await text({
        message: "Enter store alias password:",
        placeholder: "Ex: abc123",
        validate(value) {
          if (!value) return "Store alias password is required";
        },
      });
      if (isCancel(storeAliasPassword)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }
      args.push("--key-store-alias-password", storeAliasPassword as string);
    }

    const outputType = await select({
      message: "Select output type:",
      options: [
        { value: "aab", label: "AAB", hint: "Android App Bundle (.aab)" },
        { value: "apk", label: "APK", hint: "Android Package (.apk)" },
      ],
    });
    if (isCancel(outputType)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }
    args.push(`--${outputType}`);

    const copyTo = await text({
      message: "Enter output file location (optional):",
      placeholder: "dist/build.apk",
    });
    if (isCancel(copyTo)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }
    if (copyTo.trim()) {
      args.push("--copy-to", copyTo as string);
    }
  } else {
    // CUSTOM FLOW
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
          hint: "Target specific device/emulator",
        },
        {
          value: "hmr",
          label: "Enable HMR",
          hint: "Enable Hot Module Replacement",
        },
        {
          value: "aab",
          label: "Android App Bundle",
          hint: "Produces .aab instead of .apk (Android)",
        },
        {
          value: "force",
          label: "Force check",
          hint: "Skips compatibility checks",
        },
        {
          value: "env",
          label: "Environment flags",
          hint: "aot, snapshot, uglify, etc.",
        },
      ],
      required: false,
    })) as string[];

    if (isCancel(selectedOptions)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }

    let deviceId = "";

    for (const option of selectedOptions) {
      if (option === "device") {
        let stayInDeviceSelection = true;
        while (stayInDeviceSelection) {
          const sFetch = spinner();
          sFetch.start(
            `Fetching available ${pc.cyan(platform as string)} devices...`,
          );
          const availableDevices = await getAvailableDevices(
            platform as string,
          );
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
          const envFlags = envInput.split(",").map((t) => t.trim());
          envFlags.forEach((flag) => {
            args.push(`--env.${flag}`);
          });
        }
      } else {
        args.push(`--${option}`);
      }
    }
  }

  const s = spinner();
  const cmdLine = `ns ${args.join(" ")}`;
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", args, {
    stdio: ["inherit", "pipe", "inherit"],
    shell: true,
  });

  process.on("SIGINT", () => {
    child.kill("SIGINT");
    process.exit(0);
  });

  let outputStarted = false;

  child.stdout.on("data", (data) => {
    if (!outputStarted) {
      s.stop(`Executing: ${pc.green(cmdLine)}`);
      outputStarted = true;
    }
    process.stdout.write(data);
  });

  await new Promise((resolve) => {
    child.on("close", (code: number | null) => {
      if (!outputStarted) {
        s.stop(`Executing: ${pc.green(cmdLine)}`);
      }
      if (code !== 0) {
        console.log(pc.red(`\nCommand exited with code ${code}`));
      }
      outro(UI_STRINGS.outro);
      process.exit(code || 0);
    });
  });
}
