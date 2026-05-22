import {
  intro,
  outro,
  select,
  text,
  spinner,
  isCancel,
  multiselect,
} from "@clack/prompts";
import { spawn, execSync } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS, WIZARD_LEGEND } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";

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
  console.log(WIZARD_LEGEND);

  let step = "platform";
  let platform: string | symbol = "";
  let preset: string | symbol = "";
  let optionalEnvFlags: string[] = [];
  let keystorePath = "";
  let storePassword = "";
  let storeAlias = "";
  let storeAliasPassword = "";
  let outputType: string | symbol = "";
  let copyTo = "";

  // Custom Flow variables
  let customOptions: string[] = [];
  let deviceId = "";
  let envInput = "";

  for (;;) {
    switch (step) {
      case "platform": {
        platform = await select({
          message: "Select platform:",
          options: [
            { value: "android", label: "Android", hint: "Build for Android" },
            {
              value: "__back__",
              label: "◀ Go Back",
              hint: "Return to main menu",
            },
          ],
          initialValue: (platform as string) || undefined,
        });

        if (isCancel(platform) || platform === "__back__") {
          return "back";
        }

        step = "preset";
        break;
      }

      case "preset": {
        preset = await select({
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
            {
              value: "custom",
              label: "CUSTOM",
              hint: "Select options manually",
            },
            {
              value: "__back__",
              label: "◀ Go Back",
              hint: "Return to platform selection",
            },
          ],
          initialValue: (preset as string) || undefined,
        });

        if (isCancel(preset) || preset === "__back__") {
          step = "platform";
          continue;
        }

        if (preset === "production" || preset === "development") {
          step = "prod_dev_env_flags";
        } else {
          step = "custom_options";
        }
        break;
      }

      case "prod_dev_env_flags": {
        const isProd = preset === "production";
        const envOptions = isProd
          ? [
              {
                value: "commonjs",
                label: "commonjs",
                hint: "Forces CommonJS format (fixes ESM issues)",
              },
              {
                value: "aot",
                label: "aot",
                hint: "Creates Ahead-Of-Time build",
              },
              {
                value: "snapshot",
                label: "snapshot",
                hint: "Creates a V8 Snapshot",
              },
            ]
          : [
              {
                value: "uglify",
                label: "uglify",
                hint: "Basic obfuscation and smaller size",
              },
              {
                value: "commonjs",
                label: "commonjs",
                hint: "Forces CommonJS format (fixes ESM issues)",
              },
              {
                value: "aot",
                label: "aot",
                hint: "Creates Ahead-Of-Time build",
              },
            ];

        const res = await multiselect({
          message:
            "Select optional environment flags (Space to select, Enter to confirm):",
          options: envOptions,
          required: false,
          initialValues: optionalEnvFlags,
        });

        if (isCancel(res)) {
          step = "preset";
          continue;
        }

        optionalEnvFlags = res as string[];
        if (isProd) {
          step = "prod_keystore_path";
        } else {
          step = "prod_dev_output_type";
        }
        break;
      }

      case "prod_keystore_path": {
        const res = await text({
          message: "Enter full path to keystore location:",
          placeholder: "C:\\...\\my-key.keystore",
          defaultValue: keystorePath || undefined,
          validate(value) {
            if (!value) return "Keystore path is required";
          },
        });

        if (isCancel(res)) {
          step = "prod_dev_env_flags";
          continue;
        }

        keystorePath = res;
        step = "prod_store_password";
        break;
      }

      case "prod_store_password": {
        const res = await text({
          message: "Enter store password:",
          placeholder: "Ex: abc123",
          defaultValue: storePassword || undefined,
          validate(value) {
            if (!value) return "Store password is required";
          },
        });

        if (isCancel(res)) {
          step = "prod_keystore_path";
          continue;
        }

        storePassword = res;
        step = "prod_store_alias";
        break;
      }

      case "prod_store_alias": {
        const res = await text({
          message: "Enter store alias:",
          placeholder: "myalias",
          defaultValue: storeAlias || undefined,
          validate(value) {
            if (!value) return "Store alias is required";
          },
        });

        if (isCancel(res)) {
          step = "prod_store_password";
          continue;
        }

        storeAlias = res;
        step = "prod_store_alias_password";
        break;
      }

      case "prod_store_alias_password": {
        const res = await text({
          message: "Enter store alias password:",
          placeholder: "Ex: abc123",
          defaultValue: storeAliasPassword || undefined,
          validate(value) {
            if (!value) return "Store alias password is required";
          },
        });

        if (isCancel(res)) {
          step = "prod_store_alias";
          continue;
        }

        storeAliasPassword = res;
        step = "prod_dev_output_type";
        break;
      }

      case "prod_dev_output_type": {
        const isProd = preset === "production";
        const res = await select({
          message: "Select output type:",
          options: [
            { value: "aab", label: "AAB", hint: "Android App Bundle (.aab)" },
            { value: "apk", label: "APK", hint: "Android Package (.apk)" },
            { value: "__back__", label: "◀ Go Back" },
          ],
          initialValue: (outputType as string) || undefined,
        });

        if (isCancel(res) || res === "__back__") {
          if (isProd) {
            step = "prod_store_alias_password";
          } else {
            step = "prod_dev_env_flags";
          }
          continue;
        }

        outputType = res;
        step = "prod_dev_copy_to";
        break;
      }

      case "prod_dev_copy_to": {
        const res = await text({
          message: "Enter output file location (optional):",
          placeholder: "dist/build.apk",
          defaultValue: copyTo || undefined,
        });

        if (isCancel(res)) {
          step = "prod_dev_output_type";
          continue;
        }

        copyTo = res;
        step = "execute";
        break;
      }

      // CUSTOM FLOW
      case "custom_options": {
        const res = await multiselect({
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
              value: "env.aot",
              label: "Enable AOT",
              hint: "Creates Ahead-Of-Time build",
            },
            {
              value: "env.uglify",
              label: "Enable Uglify",
              hint: "Basic obfuscation and smaller size",
            },
            {
              value: "env.snapshot",
              label: "Enable V8 Snapshot",
              hint: "Creates a V8 Snapshot",
            },
            {
              value: "env.commonjs",
              label: "Enable CommonJS",
              hint: "Forces CommonJS format (fixes ESM issues)",
            },
            {
              value: "env",
              label: "Other Environment flags...",
              hint: "Enter other flags manually (e.g. report)",
            },
          ],
          required: false,
          initialValues: customOptions,
        });

        if (isCancel(res)) {
          step = "preset";
          continue;
        }

        customOptions = res as string[];
        if (customOptions.includes("device")) {
          step = "custom_device_id";
        } else if (customOptions.includes("env")) {
          step = "custom_env_input";
        } else {
          step = "execute";
        }
        break;
      }

      case "custom_device_id": {
        let stayInDeviceSelection = true;
        let wentBack = false;

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
            {
              value: "__back__",
              label: "◀ Go Back",
              hint: "Return to options selection",
            },
          ];

          const selectedDevice = await select({
            message: "Choose device:",
            options: deviceOptions,
            initialValue: deviceId || undefined,
          });

          if (isCancel(selectedDevice) || selectedDevice === "__back__") {
            wentBack = true;
            stayInDeviceSelection = false;
            break;
          }

          if (selectedDevice === "retry") {
            continue;
          }

          if (selectedDevice === "none") {
            deviceId = "";
            stayInDeviceSelection = false;
          } else if (selectedDevice === "manual") {
            const manualId = await text({
              message: "Enter Device ID:",
              placeholder: "emulator-5554",
              defaultValue: deviceId || undefined,
              validate(value: string) {
                if (value.length === 0) return `Device ID is required!`;
              },
            });

            if (isCancel(manualId)) {
              // Go back to device list, not exit
              continue;
            }

            deviceId = manualId;
            stayInDeviceSelection = false;
          } else {
            deviceId = selectedDevice;
            stayInDeviceSelection = false;
          }
        }

        if (wentBack) {
          step = "custom_options";
          continue;
        }

        if (customOptions.includes("env")) {
          step = "custom_env_input";
        } else {
          step = "execute";
        }
        break;
      }

      case "custom_env_input": {
        const res = await text({
          message: "Enter other Environment flags (comma separated):",
          placeholder: "report, hiddenSourceMap, etc.",
          defaultValue: envInput || undefined,
        });

        if (isCancel(res)) {
          if (customOptions.includes("device")) {
            step = "custom_device_id";
          } else {
            step = "custom_options";
          }
          continue;
        }

        envInput = res;
        step = "execute";
        break;
      }

      case "execute": {
        const args: string[] = ["build", platform as string];

        if (preset === "production" || preset === "development") {
          const isProd = preset === "production";

          if (isProd) {
            args.push("--env.uglify");
          }

          optionalEnvFlags.forEach((flag) => {
            args.push(`--env.${flag}`);
          });

          if (preset === "production") {
            args.push("--release");
            args.push("--key-store-path", keystorePath);
            args.push("--key-store-password", storePassword);
            args.push("--key-store-alias", storeAlias);
            args.push("--key-store-alias-password", storeAliasPassword);
          }

          args.push(`--${outputType}`);

          if (copyTo.trim()) {
            args.push("--copy-to", copyTo);
          }
        } else {
          for (const option of customOptions) {
            if (option === "device") {
              if (deviceId) {
                args.push("--device", deviceId);
              }
            } else if (option === "env") {
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

        const cleanup = setupProcessCleanup(child);

        let outputStarted = false;

        child.stdout.on("data", (data) => {
          if (!outputStarted) {
            s.stop(`Executing: ${pc.green(cmdLine)}`);
            outputStarted = true;
          }
          process.stdout.write(data);
        });

        await new Promise((_resolve) => {
          child.on("close", (code: number | null) => {
            cleanup();
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
        return;
      }
    }
  }
}
