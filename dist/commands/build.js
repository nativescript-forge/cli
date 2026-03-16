"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommand = buildCommand;
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
async function buildCommand() {
    (0, prompts_1.intro)((0, ui_1.BG_FORGE_COLOR)(" nsf build "));
    const platform = await (0, prompts_1.select)({
        message: "Select platform:",
        options: [
            { value: "android", label: "Android", hint: "Build for Android" },
        ],
    });
    if ((0, prompts_1.isCancel)(platform)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const preset = await (0, prompts_1.select)({
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
    if ((0, prompts_1.isCancel)(preset)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const args = ["build", platform];
    if (preset === "production" || preset === "development") {
        // Common flags for presets
        args.push("--env.uglify");
        if (preset === "production") {
            args.push("--release");
            const keystorePath = await (0, prompts_1.text)({
                message: "Enter full path to keystore location:",
                placeholder: "C:\\...\\my-key.keystore",
                validate(value) {
                    if (!value)
                        return "Keystore path is required";
                },
            });
            if ((0, prompts_1.isCancel)(keystorePath)) {
                (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
                process.exit(0);
            }
            args.push("--key-store-path", keystorePath);
            const storePassword = await (0, prompts_1.text)({
                message: "Enter store password:",
                placeholder: "Ex: abc123",
                validate(value) {
                    if (!value)
                        return "Store password is required";
                },
            });
            if ((0, prompts_1.isCancel)(storePassword)) {
                (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
                process.exit(0);
            }
            args.push("--key-store-password", storePassword);
            const storeAlias = await (0, prompts_1.text)({
                message: "Enter store alias:",
                placeholder: "myalias",
                validate(value) {
                    if (!value)
                        return "Store alias is required";
                },
            });
            if ((0, prompts_1.isCancel)(storeAlias)) {
                (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
                process.exit(0);
            }
            args.push("--key-store-alias", storeAlias);
            const storeAliasPassword = await (0, prompts_1.text)({
                message: "Enter store alias password:",
                placeholder: "Ex: abc123",
                validate(value) {
                    if (!value)
                        return "Store alias password is required";
                },
            });
            if ((0, prompts_1.isCancel)(storeAliasPassword)) {
                (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
                process.exit(0);
            }
            args.push("--key-store-alias-password", storeAliasPassword);
        }
        const outputType = await (0, prompts_1.select)({
            message: "Select output type:",
            options: [
                { value: "aab", label: "AAB", hint: "Android App Bundle (.aab)" },
                { value: "apk", label: "APK", hint: "Android Package (.apk)" },
            ],
        });
        if ((0, prompts_1.isCancel)(outputType)) {
            (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
            process.exit(0);
        }
        args.push(`--${outputType}`);
        const copyTo = await (0, prompts_1.text)({
            message: "Enter output file location (optional):",
            placeholder: "dist/build.apk",
        });
        if ((0, prompts_1.isCancel)(copyTo)) {
            (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
            process.exit(0);
        }
        if (copyTo.trim()) {
            args.push("--copy-to", copyTo);
        }
    }
    else {
        // CUSTOM FLOW
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
        }));
        if ((0, prompts_1.isCancel)(selectedOptions)) {
            (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
            process.exit(0);
        }
        let deviceId = "";
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
                    const envFlags = envInput.split(",").map((t) => t.trim());
                    envFlags.forEach((flag) => {
                        args.push(`--env.${flag}`);
                    });
                }
            }
            else {
                args.push(`--${option}`);
            }
        }
    }
    const s = (0, prompts_1.spinner)();
    const cmdLine = `ns ${args.join(" ")}`;
    s.start(`Executing: ${picocolors_1.default.green(cmdLine)}`);
    const child = (0, child_process_1.spawn)("ns", args, {
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
            s.stop(`Executing: ${picocolors_1.default.green(cmdLine)}`);
            outputStarted = true;
        }
        process.stdout.write(data);
    });
    await new Promise((resolve) => {
        child.on("close", (code) => {
            if (!outputStarted) {
                s.stop(`Executing: ${picocolors_1.default.green(cmdLine)}`);
            }
            if (code !== 0) {
                console.log(picocolors_1.default.red(`\nCommand exited with code ${code}`));
            }
            (0, prompts_1.outro)(ui_1.UI_STRINGS.outro);
            process.exit(code || 0);
        });
    });
}
