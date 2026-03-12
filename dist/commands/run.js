"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const prompts_1 = require("@clack/prompts");
const child_process_1 = require("child_process");
const picocolors_1 = __importDefault(require("picocolors"));
const FORGE_COLOR = (text) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;
const BG_FORGE_COLOR = (text) => `\x1b[48;2;249;168;37m\x1b[30m${text}\x1b[0m`;
async function getAvailableDevices(platform) {
    try {
        const output = (0, child_process_1.execSync)(`ns device ${platform} --available-devices`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
        const lines = output.split("\n");
        const devices = [];
        // Skip header lines (usually starts with │ or ┌)
        for (const line of lines) {
            if (line.includes("│") && !line.includes("Device Name") && !line.includes("────")) {
                const parts = line.split("│").map(p => p.trim()).filter(p => p.length > 0);
                if (parts.length >= 4) {
                    // parts structure based on ns devices output:
                    // [index, name, platform, identifier, type, status, connection]
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
    }
    catch (error) {
        return [];
    }
}
async function runCommand() {
    (0, prompts_1.intro)(BG_FORGE_COLOR(" nsf run "));
    const platform = await (0, prompts_1.select)({
        message: "Select platform:",
        options: [
            { value: "android", label: "Android", hint: "Run on Android devices/emulators" },
            { value: "ios", label: "iOS", hint: "Run on iOS devices/simulators" },
            { value: "visionos", label: "VisionOS", hint: "Run on VisionOS simulators" },
        ],
    });
    if ((0, prompts_1.isCancel)(platform)) {
        (0, prompts_1.cancel)("Operation cancelled.");
        process.exit(0);
    }
    const selectedOptions = (await (0, prompts_1.multiselect)({
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
                hint: "Pick from available devices/emulators"
            },
            {
                value: "no-hmr",
                label: "Disable HMR",
                hint: "Disable Hot Module Replacement (restarts app on change)"
            },
            {
                value: "aab",
                label: "Android App Bundle",
                hint: "Produces .aab instead of .apk for Android"
            },
            {
                value: "force",
                label: "Force check",
                hint: "Skips compatibility checks and forces dependency install"
            },
            {
                value: "env",
                label: "Environment flags",
                hint: "Pass custom flags like --env.aot, --env.uglify, etc."
            },
        ],
        required: false,
    }));
    if ((0, prompts_1.isCancel)(selectedOptions)) {
        (0, prompts_1.cancel)("Operation cancelled.");
        process.exit(0);
    }
    const args = ["run", platform];
    let deviceId = "";
    let envFlags = [];
    for (const option of selectedOptions) {
        if (option === "device") {
            let stayInDeviceSelection = true;
            while (stayInDeviceSelection) {
                const sFetch = (0, prompts_1.spinner)();
                sFetch.start(`Fetching available ${platform} devices...`);
                const availableDevices = await getAvailableDevices(platform);
                sFetch.stop(`Fetched ${availableDevices.length} devices.`);
                const deviceOptions = [
                    ...availableDevices,
                    { value: "retry", label: "🔄 Check Again", hint: "Re-scan for connected devices/emulators" },
                    { value: "none", label: "➡️ Continue without selecting", hint: "Let NativeScript CLI handle device selection/startup" },
                    { value: "manual", label: "⌨️ Input ID manually...", hint: "Enter a custom Device Identifier" }
                ];
                deviceId = (await (0, prompts_1.select)({
                    message: "Choose device:",
                    options: deviceOptions
                }));
                if ((0, prompts_1.isCancel)(deviceId)) {
                    (0, prompts_1.cancel)("Operation cancelled.");
                    process.exit(0);
                }
                if (deviceId === "retry") {
                    continue;
                }
                if (deviceId === "none") {
                    deviceId = "";
                    stayInDeviceSelection = false;
                }
                else if (deviceId === "manual") {
                    deviceId = (await (0, prompts_1.text)({
                        message: "Enter Device ID:",
                        placeholder: "emulator-5554",
                        validate(value) {
                            if (value.length === 0)
                                return `Device ID is required!`;
                        },
                    }));
                    if ((0, prompts_1.isCancel)(deviceId)) {
                        (0, prompts_1.cancel)("Operation cancelled.");
                        process.exit(0);
                    }
                    stayInDeviceSelection = false;
                }
                else {
                    stayInDeviceSelection = false;
                }
            }
            if (deviceId) {
                args.push("--device", deviceId);
            }
        }
        else if (option === "env") {
            const envInput = (await (0, prompts_1.text)({
                message: "Enter Environment flags (comma separated):",
                placeholder: "aot, snapshot, uglify, report",
            }));
            if ((0, prompts_1.isCancel)(envInput)) {
                (0, prompts_1.cancel)("Operation cancelled.");
                process.exit(0);
            }
            if (envInput.trim()) {
                envFlags = envInput.split(",").map((t) => t.trim());
                envFlags.forEach((flag) => {
                    args.push(`--env.${flag}`);
                });
            }
        }
        else {
            args.push(`--${option}`);
        }
    }
    const s = (0, prompts_1.spinner)();
    s.start(`Running NativeScript on ${FORGE_COLOR(platform)}...`);
    s.stop(`Executing: ${picocolors_1.default.green(`ns ${args.join(" ")}`)}`);
    const child = (0, child_process_1.spawn)("ns", args, { stdio: "inherit", shell: true });
    child.on("close", (code) => {
        if (code !== 0) {
            console.log(picocolors_1.default.red(`\nCommand exited with code ${code}`));
        }
        (0, prompts_1.outro)(FORGE_COLOR(" NativeScript Forge CLI! "));
        process.exit(code || 0);
    });
}
