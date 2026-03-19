"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminateProcess = terminateProcess;
exports.setupProcessCleanup = setupProcessCleanup;
const child_process_1 = require("child_process");
/**
 * Robustly kills a child process and its sub-processes,
 * especially important on Windows when shell: true is used.
 */
function terminateProcess(child) {
    if (child.pid) {
        if (process.platform === "win32") {
            try {
                // /F - Forcefully terminate
                // /T - Terminate child processes as well (process tree)
                (0, child_process_1.execSync)(`taskkill /F /T /PID ${child.pid}`, { stdio: "ignore" });
            }
            catch (e) {
                // Ignore errors if process is already dead
            }
        }
        else {
            child.kill("SIGINT");
        }
    }
}
/**
 * Sets up a SIGINT listener that terminates the child process and exits.
 * Returns a function to remove the listener.
 */
function setupProcessCleanup(child) {
    const sigintHandler = () => {
        terminateProcess(child);
        process.exit(0);
    };
    process.on("SIGINT", sigintHandler);
    return () => {
        process.removeListener("SIGINT", sigintHandler);
    };
}
