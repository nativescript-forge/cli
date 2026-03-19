import {
  intro,
  outro,
  select,
  text,
  spinner,
  isCancel,
  cancel,
  note,
} from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";

export async function proxyCommand() {
  intro(BG_FORGE_COLOR(" nsf proxy "));

  const option = await select({
    message: "Select proxy operation:",
    options: [
      { value: "show", label: "Show", hint: "Display current proxy settings" },
      { value: "set", label: "Set", hint: "Configure new proxy settings" },
      { value: "clear", label: "Clear", hint: "Remove current proxy settings" },
    ],
  });

  if (isCancel(option)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const args: string[] = ["proxy"];

  if (option === "show") {
    // No additional arguments needed for show
  } else if (option === "clear") {
    args.push("clear");
  } else if (option === "set") {
    const url = await text({
      message: "Enter Proxy URL:",
      placeholder: "http://127.0.0.1:8888",
      validate(value) {
        if (!value) return "Proxy URL is required!";
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          return "URL must start with http:// or https://";
        }
      },
    });

    if (isCancel(url)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }

    let username = "";
    let password = "";

    if (process.platform === "win32") {
      const provideAuth = await select({
        message: "Do you want to provide credentials?",
        options: [
          { value: "no", label: "No", hint: "Skip username and password" },
          { value: "yes", label: "Yes", hint: "Enter username and password" },
        ],
      });

      if (isCancel(provideAuth)) {
        cancel(UI_STRINGS.cancel);
        process.exit(0);
      }

      if (provideAuth === "yes") {
        username = (await text({
          message: "Enter Username:",
          validate(value) {
            if (!value)
              return "Username is required if you choose to provide credentials!";
          },
        })) as string;

        if (isCancel(username)) {
          cancel(UI_STRINGS.cancel);
          process.exit(0);
        }

        password = (await text({
          message: "Enter Password:",
          validate(value) {
            if (!value)
              return "Password is required if you choose to provide credentials!";
          },
        })) as string;

        if (isCancel(password)) {
          cancel(UI_STRINGS.cancel);
          process.exit(0);
        }
      }
    } else {
      note(
        pc.yellow(
          "Note: Proxy credentials (username/password) are only supported on Windows.",
        ),
        "Platform Limitation",
      );
    }

    args.push("set", url as string);
    if (username && password) {
      args.push(username, password);
    }
    args.push("--insecure");

    note(
      `Proxy settings for ${pc.cyan("npm")}, ${pc.cyan("Android Gradle")}, and ${pc.cyan("Docker")} need to be configured separately.\n\n` +
        `References:\n` +
        `- NPM: https://docs.npmjs.com/misc/config#https-proxy\n` +
        `- Gradle: https://docs.gradle.org/3.3/userguide/build_environment.html#sec:accessing_the_web_via_a_proxy\n` +
        `- Docker: https://docs.docker.com/network/proxy/`,
      "Additional Configuration Required",
    );
  }

  const s = spinner();
  const cmdLine = `ns ${args.join(" ")}`;
  s.start(`Executing: ${pc.green(cmdLine)}`);

  const child = spawn("ns", args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });

  const cleanup = setupProcessCleanup(child);

  let fullOutput = "";

  child.stdout.on("data", (data) => {
    fullOutput += data.toString();
  });

  child.stderr.on("data", (data) => {
    fullOutput += data.toString();
  });

  await new Promise((_resolve) => {
    child.on("close", (code: number | null) => {
      cleanup();
      s.stop(`Executing: ${pc.green(cmdLine)}`);

      const result = fullOutput.trim();
      if (result) {
        console.log(`\n${pc.yellow("◇")} ${pc.bold("Command Output:")}`);
        console.log(pc.cyan(result));
        console.log(); // Blank line for spacing
      }

      if (code !== 0 && code !== null) {
        console.log(pc.red(`Command exited with code ${code}`));
      }
      outro(UI_STRINGS.outro);
      process.exit(code || 0);
    });
  });
}
