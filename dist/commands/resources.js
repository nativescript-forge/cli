"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourcesCommand = resourcesCommand;
const prompts_1 = require("@clack/prompts");
const child_process_1 = require("child_process");
const picocolors_1 = __importDefault(require("picocolors"));
const FORGE_COLOR = (text) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;
const BG_FORGE_COLOR = (text) => `\x1b[48;2;249;168;37m\x1b[30m${text}\x1b[0m`;
async function resourcesCommand() {
    (0, prompts_1.intro)(BG_FORGE_COLOR(" nsf resources "));
    const resourceType = await (0, prompts_1.select)({
        message: "Select resource to generate:",
        options: [
            { value: "icons", label: "Icon" },
            { value: "splashes", label: "Splashscreen" },
        ],
    });
    if ((0, prompts_1.isCancel)(resourceType)) {
        (0, prompts_1.cancel)("Operation cancelled.");
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
        (0, prompts_1.cancel)("Operation cancelled.");
        process.exit(0);
    }
    let background = "";
    if (resourceType === "splashes") {
        background = await (0, prompts_1.text)({
            message: "Enter background color code (Optional, e.g., #000000):",
            placeholder: "#000000",
        });
        if ((0, prompts_1.isCancel)(background)) {
            (0, prompts_1.cancel)("Operation cancelled.");
            process.exit(0);
        }
    }
    const displayResourceType = resourceType === "icons" ? "Icon" : "Splashscreen";
    const s = (0, prompts_1.spinner)();
    s.start(`Generating ${displayResourceType}...`);
    try {
        const args = ["resources", "generate", resourceType, imagePath];
        if (resourceType === "splashes" && typeof background === "string" && background.trim().length > 0) {
            args.push("--background", background.trim());
        }
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
        s.stop(`${picocolors_1.default.green(displayResourceType)} generated successfully!`);
        let summaryText = `${picocolors_1.default.white("Summary:")}\n` +
            `${picocolors_1.default.dim("  Resource Type: ")} ${picocolors_1.default.cyan(resourceType === "icons" ? "Icon" : "Splashscreen")}\n` +
            `${picocolors_1.default.dim("  Source Image:  ")} ${picocolors_1.default.cyan(imagePath)}`;
        if (resourceType === "splashes" && typeof background === "string" && background.trim().length > 0) {
            summaryText += `\n${picocolors_1.default.dim("  Background:    ")} ${picocolors_1.default.cyan(background)}`;
        }
        (0, prompts_1.note)(summaryText, "Success");
        (0, prompts_1.outro)(BG_FORGE_COLOR(" NativeScript Forge CLI! "));
    }
    catch (error) {
        s.stop(`Failed to generate ${displayResourceType}.`);
        (0, prompts_1.cancel)(`Error: ${error.message}`);
        process.exit(1);
    }
}
