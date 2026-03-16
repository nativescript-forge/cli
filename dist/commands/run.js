"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const prompts_1 = require("@clack/prompts");
const child_process_1 = require("child_process");
const picocolors_1 = __importDefault(require("picocolors"));
const ui_1 = require("../utils/ui");
async function getAvailableDevices(platform) {
    try {
        const output = (0, child_process_1.execSync)(`ns device ${platform} --available-devices`, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        });
        const lines = output.split("\n");
        const devices = [];
        for (const line of lines) {
            if (line.includes("│") &&
                !line.includes("Device Name") &&
                !line.includes("────")) {
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
    }
    catch (error) {
        return [];
    }
}
async function runCommand() {
    (0, prompts_1.intro)((0, ui_1.BG_FORGE_COLOR)(" nsf run "));
    const platform = await (0, prompts_1.select)({
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
    if ((0, prompts_1.isCancel)(platform)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const selectedOptions = (await (0, prompts_1.multiselect)({
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
    }));
    if ((0, prompts_1.isCancel)(selectedOptions)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
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
                sFetch.start(`Fetching available ${picocolors_1.default.cyan(platform)} devices...`);
                const availableDevices = await getAvailableDevices(platform);
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
                deviceId = (await (0, prompts_1.select)({
                    message: "Choose device:",
                    options: deviceOptions,
                }));
                if ((0, prompts_1.isCancel)(deviceId)) {
                    (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
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
                        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
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
                (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
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
    const cmdLine = `ns ${args.join(" ")}`;
    s.start(`Executing: ${picocolors_1.default.green(cmdLine)}`);
    const child = (0, child_process_1.spawn)("ns", args, { stdio: ["inherit", "pipe", "inherit"], shell: true });
    let outputStarted = false;
    child.stdout.on("data", (data) => {
        if (!outputStarted) {
            s.stop(`Executing: ${picocolors_1.default.green(cmdLine)}`);
            console.log(`\n${picocolors_1.default.yellow("◇")} ${picocolors_1.default.bold("Command Output:")}`);
            outputStarted = true;
        }
        process.stdout.write(data);
    });
    await new Promise((resolve) => {
        child.on("close", (code) => {
            if (!outputStarted) {
                s.stop(`Executing: ${picocolors_1.default.green(cmdLine)}`);
            }
            else {
                console.log(); // Blank line for spacing
            }
            if (code !== 0 && code !== null) {
                console.log(picocolors_1.default.red(`Command exited with code ${code}`));
            }
            else {
                (0, prompts_1.note)(`${picocolors_1.default.white("Summary:")}\n` +
                    `${picocolors_1.default.dim("  Platform: ")} ${picocolors_1.default.cyan(platform)}\n` +
                    `${picocolors_1.default.dim("  Options:  ")} ${picocolors_1.default.cyan(selectedOptions.join(", ") || "Default")}`, "Run Finished");
            }
            (0, prompts_1.outro)(ui_1.UI_STRINGS.outro);
            process.exit(code || 0);
        });
    });
}
