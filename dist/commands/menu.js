"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCommand = menuCommand;
const prompts_1 = require("@clack/prompts");
const ui_1 = require("../utils/ui");
const picocolors_1 = __importDefault(require("picocolors"));
const create_1 = require("./create");
const run_1 = require("./run");
const debug_1 = require("./debug");
const build_1 = require("./build");
const resources_1 = require("./resources");
const proxy_1 = require("./proxy");
const doctor_1 = require("./doctor");
const info_1 = require("./info");
async function menuCommand() {
    const pkg = require("../../package.json");
    (0, prompts_1.intro)(`${(0, ui_1.BG_FORGE_COLOR)(" NativeScript Forge ")} ${picocolors_1.default.dim(`v${pkg.version}`)}`);
    const command = await (0, prompts_1.select)({
        message: "Select a command to run:",
        options: [
            {
                value: "create",
                label: picocolors_1.default.bold("Create"),
                hint: picocolors_1.default.dim("Create a new NativeScript project"),
            },
            {
                value: "run",
                label: picocolors_1.default.bold("Run"),
                hint: picocolors_1.default.dim("Run the project on a device/emulator"),
            },
            {
                value: "debug",
                label: picocolors_1.default.bold("Debug"),
                hint: picocolors_1.default.dim("Debug the project on a device/emulator"),
            },
            {
                value: "build",
                label: picocolors_1.default.bold("Build"),
                hint: picocolors_1.default.dim("Build the project for Android/iOS"),
            },
            {
                value: "resources",
                label: picocolors_1.default.bold("Resources"),
                hint: picocolors_1.default.dim("Generate icons and splash screens"),
            },
            {
                value: "proxy",
                label: picocolors_1.default.bold("Proxy"),
                hint: picocolors_1.default.dim("Manage proxy settings"),
            },
            {
                value: "doctor",
                label: picocolors_1.default.bold("Doctor"),
                hint: picocolors_1.default.dim("Check environment health"),
            },
            {
                value: "info",
                label: picocolors_1.default.bold("Info"),
                hint: picocolors_1.default.dim("System and environment information"),
            },
        ],
    });
    if ((0, prompts_1.isCancel)(command)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    switch (command) {
        case "create":
            await (0, create_1.createCommand)();
            break;
        case "run":
            await (0, run_1.runCommand)();
            break;
        case "debug":
            await (0, debug_1.debugCommand)();
            break;
        case "build":
            await (0, build_1.buildCommand)();
            break;
        case "resources":
            await (0, resources_1.resourcesCommand)();
            break;
        case "proxy":
            await (0, proxy_1.proxyCommand)();
            break;
        case "doctor":
            await (0, doctor_1.doctorCommand)();
            break;
        case "info":
            await (0, info_1.infoCommand)();
            break;
    }
}
