import { ChildProcess, execSync } from "child_process";

/**
 * Robustly kills a child process and its sub-processes, 
 * especially important on Windows when shell: true is used.
 */
export function terminateProcess(child: ChildProcess) {
  if (child.pid) {
    if (process.platform === "win32") {
      try {
        // /F - Forcefully terminate
        // /T - Terminate child processes as well (process tree)
        execSync(`taskkill /F /T /PID ${child.pid}`, { stdio: "ignore" });
      } catch (e) {
        // Ignore errors if process is already dead
      }
    } else {
      child.kill("SIGINT");
    }
  }
}

/**
 * Sets up a SIGINT listener that terminates the child process and exits.
 * Returns a function to remove the listener.
 */
export function setupProcessCleanup(child: ChildProcess): () => void {
  const sigintHandler = () => {
    terminateProcess(child);
    process.exit(0);
  };

  process.on("SIGINT", sigintHandler);

  return () => {
    process.removeListener("SIGINT", sigintHandler);
  };
}
