"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourcesCommand = resourcesCommand;
const prompts_1 = require("@clack/prompts");
const child_process_1 = require("child_process");
const picocolors_1 = __importDefault(require("picocolors"));
const ui_1 = require("../utils/ui");
const process_1 = require("../utils/process");
async function resourcesCommand() {
    (0, prompts_1.intro)((0, ui_1.BG_FORGE_COLOR)(" nsf resources "));
    const resourceType = await (0, prompts_1.select)({
        message: "Select resource to generate:",
        options: [
            { value: "icons", label: "Icon" },
            { value: "splashes", label: "Splashscreen" },
        ],
    });
    if ((0, prompts_1.isCancel)(resourceType)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    const imagePath = await (0, prompts_1.text)({
        message: "Enter the real path of the image (Recommended size: 1080x1080 pixels):",
        placeholder: "C:\\...\\myicon.png",
        validate(value) {
            if (value.trim().length === 0)
                return "Image path is required!";
        },
    });
    if ((0, prompts_1.isCancel)(imagePath)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    let background = "";
    if (resourceType === "splashes") {
        background = await (0, prompts_1.text)({
            message: "Enter background color code (Optional, e.g., #000000):",
            placeholder: "#000000",
        });
        if ((0, prompts_1.isCancel)(background)) {
            (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
            process.exit(0);
        }
    }
    const displayResourceType = resourceType === "icons" ? "Icon" : "Splashscreen";
    const args = [
        "resources",
        "generate",
        resourceType,
        imagePath,
    ];
    if (resourceType === "splashes" &&
        typeof background === "string" &&
        background.trim().length > 0) {
        args.push("--background", background.trim());
    }
    const s = (0, prompts_1.spinner)();
    s.start(`Preparing ${picocolors_1.default.cyan(displayResourceType)}...`);
    s.stop(`Executing: ${picocolors_1.default.green(`ns ${args.join(" ")}`)}`);
    try {
        const child = (0, child_process_1.spawn)("ns", args, { stdio: "inherit", shell: true });
        const cleanup = (0, process_1.setupProcessCleanup)(child);
        await new Promise((resolve, reject) => {
            child.on("close", (code) => {
                cleanup();
                if (code === 0) {
                    resolve(true);
                }
                else {
                    reject(new Error(`Exit code: ${code}`));
                }
            });
        });
        let summaryText = `${picocolors_1.default.white("Summary:")}\n` +
            `${picocolors_1.default.dim("  Resource Type: ")} ${picocolors_1.default.cyan(resourceType === "icons" ? "Icon" : "Splashscreen")}\n` +
            `${picocolors_1.default.dim("  Source Image:  ")} ${picocolors_1.default.cyan(imagePath)}`;
        if (resourceType === "splashes" &&
            typeof background === "string" &&
            background.trim().length > 0) {
            summaryText += `\n${picocolors_1.default.dim("  Background:    ")} ${picocolors_1.default.cyan(background)}`;
        }
        (0, prompts_1.note)(summaryText, "Success");
        (0, prompts_1.outro)(ui_1.UI_STRINGS.outro);
    }
    catch (error) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.error(error.message));
        process.exit(1);
    }
}
