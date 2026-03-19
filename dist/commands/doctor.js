"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorCommand = doctorCommand;
const prompts_1 = require("@clack/prompts");
const child_process_1 = require("child_process");
const picocolors_1 = __importDefault(require("picocolors"));
const ui_1 = require("../utils/ui");
const process_1 = require("../utils/process");
async function doctorCommand() {
    (0, prompts_1.intro)((0, ui_1.BG_FORGE_COLOR)(" nsf doctor "));
    const s = (0, prompts_1.spinner)();
    const cmdLine = "ns doctor";
    s.start(`Executing: ${picocolors_1.default.green(cmdLine)}`);
    const child = (0, child_process_1.spawn)("ns", ["doctor"], {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
    });
    const cleanup = (0, process_1.setupProcessCleanup)(child);
    let fullOutput = "";
    child.stdout.on("data", (data) => {
        fullOutput += data.toString();
    });
    child.stderr.on("data", (data) => {
        fullOutput += data.toString();
    });
    await new Promise((resolve) => {
        child.on("close", (code) => {
            cleanup();
            s.stop(`Executing: ${picocolors_1.default.green(cmdLine)}`);
            const result = fullOutput.trim();
            if (result) {
                console.log(`\n${picocolors_1.default.yellow("◇")} ${picocolors_1.default.bold("Command Output:")}`);
                console.log(picocolors_1.default.cyan(result));
                console.log();
            }
            if (code !== 0 && code !== null) {
                console.log(picocolors_1.default.red(`Command exited with code ${code}`));
            }
            (0, prompts_1.outro)(ui_1.UI_STRINGS.outro);
            process.exit(code || 0);
        });
    });
}
