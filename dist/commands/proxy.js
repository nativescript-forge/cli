"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyCommand = proxyCommand;
const prompts_1 = require("@clack/prompts");
const child_process_1 = require("child_process");
const picocolors_1 = __importDefault(require("picocolors"));
const ui_1 = require("../utils/ui");
async function proxyCommand() {
    (0, prompts_1.intro)((0, ui_1.BG_FORGE_COLOR)(" nsf proxy "));
    const option = await (0, prompts_1.select)({
        message: "Select proxy operation:",
        options: [
            { value: "show", label: "Show", hint: "Display current proxy settings" },
            { value: "set", label: "Set", hint: "Configure new proxy settings" },
            { value: "clear", label: "Clear", hint: "Remove current proxy settings" },
        ],
    });
    if ((0, prompts_1.isCancel)(option)) {
        (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
        process.exit(0);
    }
    let args = ["proxy"];
    if (option === "show") {
        // No additional arguments needed for show
    }
    else if (option === "clear") {
        args.push("clear");
    }
    else if (option === "set") {
        const url = await (0, prompts_1.text)({
            message: "Enter Proxy URL:",
            placeholder: "http://127.0.0.1:8888",
            validate(value) {
                if (!value)
                    return "Proxy URL is required!";
                if (!value.startsWith("http://") && !value.startsWith("https://")) {
                    return "URL must start with http:// or https://";
                }
            },
        });
        if ((0, prompts_1.isCancel)(url)) {
            (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
            process.exit(0);
        }
        let username = "";
        let password = "";
        if (process.platform === "win32") {
            const provideAuth = await (0, prompts_1.select)({
                message: "Do you want to provide credentials?",
                options: [
                    { value: "no", label: "No", hint: "Skip username and password" },
                    { value: "yes", label: "Yes", hint: "Enter username and password" },
                ],
            });
            if ((0, prompts_1.isCancel)(provideAuth)) {
                (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
                process.exit(0);
            }
            if (provideAuth === "yes") {
                username = (await (0, prompts_1.text)({
                    message: "Enter Username:",
                    validate(value) {
                        if (!value)
                            return "Username is required if you choose to provide credentials!";
                    },
                }));
                if ((0, prompts_1.isCancel)(username)) {
                    (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
                    process.exit(0);
                }
                password = (await (0, prompts_1.text)({
                    message: "Enter Password:",
                    validate(value) {
                        if (!value)
                            return "Password is required if you choose to provide credentials!";
                    },
                }));
                if ((0, prompts_1.isCancel)(password)) {
                    (0, prompts_1.cancel)(ui_1.UI_STRINGS.cancel);
                    process.exit(0);
                }
            }
        }
        else {
            (0, prompts_1.note)(picocolors_1.default.yellow("Note: Proxy credentials (username/password) are only supported on Windows."), "Platform Limitation");
        }
        args.push("set", url);
        if (username && password) {
            args.push(username, password);
        }
        args.push("--insecure");
        (0, prompts_1.note)(`Proxy settings for ${picocolors_1.default.cyan("npm")}, ${picocolors_1.default.cyan("Android Gradle")}, and ${picocolors_1.default.cyan("Docker")} need to be configured separately.\n\n` +
            `References:\n` +
            `- NPM: https://docs.npmjs.com/misc/config#https-proxy\n` +
            `- Gradle: https://docs.gradle.org/3.3/userguide/build_environment.html#sec:accessing_the_web_via_a_proxy\n` +
            `- Docker: https://docs.docker.com/network/proxy/`, "Additional Configuration Required");
    }
    const s = (0, prompts_1.spinner)();
    const cmdLine = `ns ${args.join(" ")}`;
    s.start(`Executing: ${picocolors_1.default.green(cmdLine)}`);
    const child = (0, child_process_1.spawn)("ns", args, {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
    });
    let fullOutput = "";
    child.stdout.on("data", (data) => {
        fullOutput += data.toString();
    });
    child.stderr.on("data", (data) => {
        fullOutput += data.toString();
    });
    await new Promise((resolve) => {
        child.on("close", (code) => {
            s.stop(`Executing: ${picocolors_1.default.green(cmdLine)}`);
            const result = fullOutput.trim();
            if (result) {
                console.log(`\n${picocolors_1.default.yellow("◇")} ${picocolors_1.default.bold("Command Output:")}`);
                console.log(picocolors_1.default.cyan(result));
                console.log(); // Blank line for spacing
            }
            if (code !== 0 && code !== null) {
                console.log(picocolors_1.default.red(`Command exited with code ${code}`));
            }
            (0, prompts_1.outro)(ui_1.UI_STRINGS.outro);
            process.exit(code || 0);
        });
    });
}
