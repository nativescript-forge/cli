"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = createCommand;
const prompts_1 = require("@clack/prompts");
const child_process_1 = require("child_process");
const picocolors_1 = __importDefault(require("picocolors"));
const constants_1 = require("../utils/constants");
const ui_1 = require("../utils/ui");
async function createCommand(passedAppName) {
    (0, prompts_1.intro)((0, ui_1.BG_FORGE_COLOR)(" nsf create "));
    let appName = passedAppName;
    if (!appName) {
        appName = (await (0, prompts_1.text)({
            message: "What is your application name?",
            placeholder: "my-cool-app",
            validate(value) {
                if (value.length === 0)
                    return `Value is required!`;
            },
        }));
    }
    if ((0, prompts_1.isCancel)(appName)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const platformKey = await (0, prompts_1.select)({
        message: "Select platform:",
        options: Object.entries(constants_1.TEMPLATE_MAPPING).map(([key, platform]) => ({
            value: key,
            label: platform.name,
        })),
    });
    if ((0, prompts_1.isCancel)(platformKey)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const platform = constants_1.TEMPLATE_MAPPING[platformKey];
    // Only show flavors that have templates
    const flavorOptions = platform.flavors
        .filter((f) => f.templates.length > 0)
        .map((f) => ({
        value: f.name,
        label: f.name,
    }));
    if (flavorOptions.length === 0) {
        (0, prompts_1.cancel)(`No templates available for ${platform.name}.`);
        process.exit(0);
    }
    const flavorName = await (0, prompts_1.select)({
        message: "Select flavor:",
        options: flavorOptions,
    });
    if ((0, prompts_1.isCancel)(flavorName)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const flavor = platform.flavors.find((f) => f.name === flavorName);
    if (!flavor) {
        (0, prompts_1.cancel)("Invalid flavor selection.");
        process.exit(0);
    }
    const templateValue = await (0, prompts_1.select)({
        message: "Select template:",
        options: flavor.templates.map((t) => ({
            value: t.value,
            label: t.name,
        })),
    });
    if ((0, prompts_1.isCancel)(templateValue)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const platformLabel = platform.name;
    const flavorLabel = flavorName;
    const templateLabel = flavor.templates.find((t) => t.value === templateValue)?.name || "Default";
    const args = ["create", appName, "--template", templateValue];
    const s = (0, prompts_1.spinner)();
    const cmdLine = `ns ${args.join(" ")}`;
    s.start(`Executing: ${picocolors_1.default.green(cmdLine)}`);
    try {
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
        await new Promise((resolve, reject) => {
            child.on("close", (code) => {
                if (!outputStarted) {
                    s.stop(`Executing: ${picocolors_1.default.green(cmdLine)}`);
                }
                if (code === 0) {
                    resolve(true);
                }
                else {
                    reject(new Error(`Exit code: ${code}`));
                }
            });
        });
        (0, prompts_1.note)(`${picocolors_1.default.white("Summary:")}\n` +
            `${picocolors_1.default.dim("  Platform: ")} ${picocolors_1.default.cyan(platformLabel)}\n` +
            `${picocolors_1.default.dim("  Flavor:   ")} ${picocolors_1.default.cyan(flavorLabel)}\n` +
            `${picocolors_1.default.dim("  Template: ")} ${picocolors_1.default.cyan(templateLabel)}\n\n` +
            `${picocolors_1.default.white("Next steps:")}\n` +
            picocolors_1.default.cyan(`  cd ${appName}\n`) +
            picocolors_1.default.cyan(`  ns run android|ios|visionos`), "Success");
        (0, prompts_1.outro)(ui_1.UI_STRINGS.outro);
    }
    catch (error) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.error(error.message));
        process.exit(1);
    }
}
