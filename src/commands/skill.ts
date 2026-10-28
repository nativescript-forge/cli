import {
  intro,
  outro,
  select,
  note,
  confirm,
  isCancel,
  cancel,
} from "@clack/prompts";
import { spawn } from "child_process";
import {
  SKILL_SOURCES,
  findSkillSource,
  SkillSource,
} from "../utils/skill-sources";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";

type Choice = { value: string; label: string; hint?: string };
type SkillMode = "list" | "guide";
const choose = (message: string, options: Choice[]) =>
  select<Choice[], string>({ message, options });

export async function skillCommand(mode?: SkillMode, source?: string) {
  intro(BG_FORGE_COLOR(" nsf skill "));
  let collection = source !== undefined ? findSkillSource(source) : undefined;
  if (source !== undefined && !collection) {
    cancel(
      "Unknown skill collection. Choose: " +
        SKILL_SOURCES.map((entry) => entry.id).join(", ") +
        ".",
    );
    process.exitCode = 1;
    return;
  }
  for (;;) {
    if (!mode) {
      const operation = await choose("Select skill operation:", [
        {
          value: "list",
          label: "List",
          hint: "Browse available skill collections and install",
        },
        {
          value: "guide",
          label: "Guide",
          hint: "Learn how to use each collection, with examples",
        },
        { value: "__back__", label: "Go Back", hint: "Return to main menu" },
      ]);
      if (isCancel(operation)) return cancelled();
      if (operation === "__back__") return "back";
      mode = operation as SkillMode;
    }
    if (!collection) {
      const selected = await choose(
        mode === "list"
          ? "Select a skill collection to install:"
          : "Select a skill collection guide:",
        [
          ...SKILL_SOURCES.map((entry) => ({
            value: entry.id,
            label: entry.label,
            hint: entry.description,
          })),
          {
            value: "__back__",
            label: "Go Back",
            hint: "Return to List / Guide",
          },
        ],
      );
      if (isCancel(selected)) return cancelled();
      if (selected === "__back__") {
        mode = undefined;
        continue;
      }
      collection = findSkillSource(selected);
      if (!collection) continue;
    }
    if (mode === "guide") {
      showSkillGuide(collection);
      if (source !== undefined) {
        outro(UI_STRINGS.outro);
        return;
      }
      collection = undefined;
      continue;
    }
    showSkillDetails(collection);
    const proceed = await confirm({
      message: "Install skills from " + collection.label + "?",
      initialValue: true,
    });
    if (isCancel(proceed)) return cancelled();
    if (!proceed) {
      collection = undefined;
      continue;
    }
    await installSkills(collection.repository);
    return;
  }
}

function cancelled() {
  cancel(UI_STRINGS.cancel);
  return "back" as const;
}

export async function skillGuideCommand(source?: string) {
  return skillCommand("guide", source);
}

function sourceDetails(collection: SkillSource) {
  return (
    collection.description +
    "\n\nWhat these skills help with:\n" +
    collection.capabilities.map((item) => "  - " + item).join("\n") +
    "\n\nGitHub: https://github.com/" +
    collection.repository +
    "\nDocumentation: https://github.com/" +
    collection.repository +
    "/blob/main/README.md"
  );
}

function showSkillDetails(collection: SkillSource) {
  note(
    sourceDetails(collection) +
      "\n\nThis is a collection of agent skills, not a NativeScript runtime plugin.\n" +
      "If you continue, the installer lets you select individual skills, agents,\n" +
      "project/global scope, and installation method before its final confirmation.",
    collection.label,
  );
}

function showSkillGuide(collection: SkillSource) {
  note(
    sourceDetails(collection) +
      "\n\nHow to use:\n" +
      "1. Install the relevant skills from this collection for your coding agent.\n" +
      "2. Open the NativeScript project in the agent selected during installation.\n" +
      "3. Describe the task and provide relevant files, configuration, or errors.\n" +
      "   Your agent can discover installed skills; you can also mention a skill by name.\n" +
      "4. If a newly installed skill is not discovered, start a new session and\n" +
      "   check that it was installed for the correct agent and project.\n\n" +
      "Example prompts in your coding agent (not terminal commands):\n\n" +
      collection.examples.map((example) => '  "' + example + '"').join("\n\n") +
      "\n\nExamples require the named skill to be installed.\n" +
      "Project skills apply to the installation project; global skills apply\n" +
      "across projects for the selected agents. See the README for the current skill list.",
    collection.label + " - Guide",
  );
}

async function installSkills(repository: string) {
  const args = ["--yes", "skills@latest", "add", repository];

  // Keep the installer's prompts visible and interactive; do not capture its output.
  await new Promise<void>((resolve) => {
    const child = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      args,
      {
        stdio: "inherit",
        shell: process.platform === "win32",
        cwd: process.cwd(),
      },
    );
    const cleanup = setupProcessCleanup(child);
    let failedToStart = false;
    child.once("error", (error) => {
      failedToStart = true;
      cleanup();
      cancel(
        `Unable to start the skills installer: ${error.message}. Check that Node.js and npm/npx are installed.`,
      );
      process.exitCode = 1;
      resolve();
    });
    child.once("close", (code, signal) => {
      if (failedToStart) return;
      cleanup();
      if (code === 0) outro(UI_STRINGS.outro);
      else {
        cancel(
          signal
            ? `Skills installer terminated by ${signal}`
            : `Skills installer exited with code ${code ?? 1}`,
        );
        process.exitCode = code ?? 1;
      }
      resolve();
    });
  });
}
