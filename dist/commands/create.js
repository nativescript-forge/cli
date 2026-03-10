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
async function createCommand() {
    (0, prompts_1.intro)(picocolors_1.default.bgCyan(picocolors_1.default.black(" nsf create ")));
    const appName = await (0, prompts_1.text)({
        message: "What is your application name?",
        placeholder: "my-cool-app",
        validate(value) {
            if (value.length === 0)
                return `Value is required!`;
        },
    });
    if ((0, prompts_1.isCancel)(appName)) {
        (0, prompts_1.cancel)("Operation cancelled.");
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
        (0, prompts_1.cancel)("Operation cancelled.");
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
        (0, prompts_1.cancel)("Operation cancelled.");
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
        (0, prompts_1.cancel)("Operation cancelled.");
        process.exit(0);
    }
    const platformLabel = platform.name;
    const flavorLabel = flavorName;
    const templateLabel = flavor.templates.find((t) => t.value === templateValue)?.name || "Default";
    const s = (0, prompts_1.spinner)();
    s.start(`Creating application ${picocolors_1.default.cyan(appName)}...`);
    try {
        const args = ["create", appName, "--template", templateValue];
        const child = (0, child_process_1.spawn)("ns", args, { stdio: "ignore", shell: true });
        await new Promise((resolve, reject) => {
            child.on("close", (code) => {
                if (code === 0) {
                    resolve(true);
                }
                else {
                    reject(new Error(`Exit code: ${code}`));
                }
            });
        });
        s.stop(`Application ${picocolors_1.default.green(appName)} created successfully!`);
        (0, prompts_1.note)(`${picocolors_1.default.white("Summary:")}\n` +
            `${picocolors_1.default.dim("  Platform: ")} ${picocolors_1.default.cyan(platformLabel)}\n` +
            `${picocolors_1.default.dim("  Flavor:   ")} ${picocolors_1.default.cyan(flavorLabel)}\n` +
            `${picocolors_1.default.dim("  Template: ")} ${picocolors_1.default.cyan(templateLabel)}\n\n` +
            `${picocolors_1.default.white("Next steps:")}\n` +
            picocolors_1.default.cyan(`  cd ${appName}\n`) +
            picocolors_1.default.cyan(`  ns run android|ios|visionos`), "Success");
        (0, prompts_1.outro)(picocolors_1.default.bgCyan(picocolors_1.default.black(" NativeScript Forge CLI! ")));
    }
    catch (error) {
        s.stop("Failed to create application.");
        (0, prompts_1.cancel)(`Error: ${error.message}`);
        process.exit(1);
    }
}
