import {
  intro,
  outro,
  select,
  text,
  spinner,
  note,
  isCancel,
  cancel,
  multiselect,
} from "@clack/prompts";
import { spawn, execSync } from "child_process";
import pc from "picocolors";

const FORGE_COLOR = (text: string) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;
const BG_FORGE_COLOR = (text: string) => `\x1b[48;2;249;168;37m\x1b[30m${text}\x1b[0m`;

async function getAvailableDevices(platform: string): Promise<{ label: string; value: string; hint?: string }[]> {
  try {
    const output = execSync(`ns device ${platform} --available-devices`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const lines = output.split("\n");
    const devices: { label: string; value: string; hint?: string }[] = [];

    for (const line of lines) {
      if (line.includes("│") && !line.includes("Device Name") && !line.includes("────")) {
        const parts = line.split("│").map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length >= 4) {
          const name = parts[1];
          const identifier = parts[3];
          const type = parts[4];
          devices.push({
            label: name,
            value: identifier,
            hint: `${type} (${identifier})`
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
      { value: "ios", label: "iOS", hint: "Build for iOS" },
      { value: "visionos", label: "VisionOS", hint: "Build for VisionOS" },
    ],
  });

  if (isCancel(platform)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const selectedOptions = (await multiselect({
    message: "Select options (Space to select, Enter to confirm):",
    options: [
      { 
        value: "release", 
        label: "Release build", 
        hint: "Produces a production build with optimizations" 
      },
      { 
        value: "justlaunch", 
        label: "Just launch", 
        hint: "Launch app without printing output to console" 
      },
      { 
        value: "device", 
        label: "Select device", 
        hint: "Target specific device/emulator" 
      },
      { 
        value: "hmr", 
        label: "Enable HMR", 
        hint: "Enable Hot Module Replacement" 
      },
      { 
        value: "aab", 
        label: "Android App Bundle", 
        hint: "Produces .aab instead of .apk (Android)" 
      },
      { 
        value: "force", 
        label: "Force check", 
        hint: "Skips compatibility checks" 
      },
      { 
        value: "env", 
        label: "Environment flags", 
        hint: "aot, snapshot, uglify, etc." 
      },
    ],
    required: false,
  })) as string[];

  if (isCancel(selectedOptions)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const args: string[] = ["build", platform as string];
  let deviceId = "";

  for (const option of selectedOptions) {
    if (option === "device") {
      let stayInDeviceSelection = true;
      while (stayInDeviceSelection) {
        const sFetch = spinner();
        sFetch.start(`Fetching available ${platform} devices...`);
        const availableDevices = await getAvailableDevices(platform as string);
        sFetch.stop(`Fetched ${availableDevices.length} devices.`);

        const deviceOptions = [
          ...availableDevices,
          { value: "retry", label: "🔄 Check Again", hint: "Re-scan for connected devices" },
          { value: "none", label: "➡️ Continue without selecting", hint: "Skip specifying a device" },
          { value: "manual", label: "⌨️ Input ID manually...", hint: "Enter a custom Device Identifier" }
        ];

        deviceId = (await select({
          message: "Choose device:",
          options: deviceOptions
        })) as string;

        if (isCancel(deviceId)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }

        if (deviceId === "retry") continue;
        if (deviceId === "none") { deviceId = ""; stayInDeviceSelection = false; }
        else if (deviceId === "manual") {
          deviceId = (await text({
            message: "Enter Device ID:",
            placeholder: "emulator-5554",
            validate(value: string) { if (value.length === 0) return `Device ID is required!`; }
          })) as string;
          if (isCancel(deviceId)) { cancel("Operation cancelled."); process.exit(0); }
          stayInDeviceSelection = false;
        } else {
          stayInDeviceSelection = false;
        }
      }
      if (deviceId) args.push("--device", deviceId);
    } else if (option === "env") {
      const envInput = (await text({
        message: "Enter Env flags (e.g. aot, snapshot, uglify):",
        placeholder: "aot, snapshot, uglify",
      })) as string;

      if (isCancel(envInput)) { cancel("Operation cancelled."); process.exit(0); }
      if (envInput.trim()) {
        envInput.split(",").map(t => t.trim()).forEach(flag => args.push(`--env.${flag}`));
      }
    } else {
      args.push(`--${option}`);
    }
  }

  const s = spinner();
  s.start(`Building NativeScript for ${FORGE_COLOR(platform as string)}...`);
  s.stop(`Executing: ${pc.green(`ns ${args.join(" ")}`)}`);

  const child = spawn("ns", args, { stdio: "inherit", shell: true });

  child.on("close", (code: number | null) => {
    if (code !== 0) console.log(pc.red(`\nBuild failed with code ${code}`));
    outro(FORGE_COLOR(" NativeScript Forge CLI! "));
    process.exit(code || 0);
  });
}
