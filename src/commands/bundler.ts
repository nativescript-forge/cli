import {
  intro,
  outro,
  select,
  spinner,
  isCancel,
  cancel,
  note,
  confirm,
} from "@clack/prompts";
import { spawn } from "child_process";
import pc from "picocolors";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";
import { setupProcessCleanup } from "../utils/process";
import { readFileSync, existsSync, writeFileSync, renameSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import path from "path";

export async function bundlerCommand() {
  intro(BG_FORGE_COLOR(" nsf bundler "));

  const pkgPath = path.join(process.cwd(), "package.json");
  if (!existsSync(pkgPath)) {
    cancel("No package.json found. Are you in a NativeScript project?");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  
  const currentBundler = detectBundler(pkg);
  const flavor = detectFlavor(pkg);

  console.log(
    `${pc.yellow("◇")} ${pc.bold("Current Status:")}\n` +
    `  ${pc.dim("Bundler: ")} ${pc.cyan(currentBundler === "webpack" ? "Webpack (Classic)" : currentBundler === "vite" ? "Vite (Modern)" : "Unknown")}\n` +
    `  ${pc.dim("Flavor:  ")} ${pc.cyan(flavor.charAt(0).toUpperCase() + flavor.slice(1))}\n`
  );

  const targetBundler = currentBundler === "webpack" ? "vite" : "webpack";
  const webpackBackups = getAvailableBackups("webpack");
  const viteBackups = getAvailableBackups("vite");
  const hasBackups = webpackBackups.length > 0 || viteBackups.length > 0;

  const actionOptions: any[] = [
    {
      value: "switch",
      label: pc.bold(`Switch to ${targetBundler.toUpperCase()}`),
      hint: pc.dim(`Replace ${currentBundler} with ${targetBundler}`),
    },
  ];

  if (hasBackups) {
    actionOptions.push({
      value: "restore",
      label: pc.bold(`Restore Config from Backup`),
      hint: pc.dim(`Choose from existing Webpack or Vite backups`),
    });
  }

  actionOptions.push({ value: "cancel", label: "Cancel" });

  const action = await select({
    message: `Choose an action for ${pc.bold(targetBundler === "vite" ? "Vite (Modern)" : "Webpack (Classic)")}:`,
    options: actionOptions,
  });

  if (isCancel(action) || action === "cancel") {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  let selectedBackupTimestamp = "";
  let selectedBackupType: "webpack" | "vite" = "webpack";

  if (action === "restore") {
    const allBackups = [
      ...webpackBackups.map((b) => ({ timestamp: b, type: "webpack" as const })),
      ...viteBackups.map((b) => ({ timestamp: b, type: "vite" as const })),
    ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const selected = await select({
      message: "Select backup to restore:",
      options: allBackups.map((b) => ({
        value: JSON.stringify(b),
        label: `${pc.yellow(`[${b.type.toUpperCase()}]`)} ${b.timestamp}`,
      })),
    });

    if (isCancel(selected)) {
      cancel(UI_STRINGS.cancel);
      process.exit(0);
    }
    
    const parsed = JSON.parse(selected as string);
    selectedBackupTimestamp = parsed.timestamp;
    selectedBackupType = parsed.type;
  }

  const s = spinner();
  s.start(`Backing up current configuration...`);
  backupProject(currentBundler as "webpack" | "vite");
  
  if (action === "restore") {
    s.message(`Restoring ${pc.green(selectedBackupType)} config from ${selectedBackupTimestamp}...`);
  } else {
    s.message(`Switching to ${pc.green(targetBundler)}...`);
  }

  try {
    if (action === "restore") {
      await performRestore(selectedBackupType, selectedBackupTimestamp, flavor, s);
    } else {
      await performSwitch(targetBundler, flavor, s);
    }
    s.stop(
      `${action === "restore" ? "Restored" : "Switched"} to ${pc.green(
        action === "restore" ? selectedBackupType : targetBundler
      )} successfully!`,
    );
    
    const runClean = await confirm({
      message: "Would you like to run 'ns clean' now? (Recommended to avoid crashes)",
      initialValue: true,
    });

    if (runClean && !isCancel(runClean)) {
      s.start("Running ns clean...");
      await runCommand("ns", ["clean"]);
      s.stop("Project cleaned!");
    }

    note(
      `${pc.white("Summary:")}\n` +
      `${pc.dim("  Previous: ")} ${pc.strikethrough(pc.red(currentBundler))}\n` +
      `${pc.dim("  Current:  ")} ${pc.green(action === "restore" ? selectedBackupType : targetBundler)}\n\n` +
      `${pc.yellow(pc.bold("Recommendation:"))}\n` +
      `  Always run ${pc.cyan("ns clean")} after switching bundlers to\n` +
      `  ensure all old build artifacts are removed.\n\n` +
      `${pc.white("Next steps:")}\n` +
      pc.cyan(`  ns run android|ios`),
      "Success"
    );

    outro(UI_STRINGS.outro);
  } catch (error: any) {
    s.stop(`Error switching to ${targetBundler}`);
    cancel(UI_STRINGS.error(error.message));
    process.exit(1);
  }
}

function detectBundler(pkg: any): "webpack" | "vite" | "unknown" {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (deps["@nativescript/vite"]) return "vite";
  if (deps["@nativescript/webpack"]) return "webpack";
  return "unknown";
}

function detectFlavor(pkg: any): string {
  const deps = pkg.dependencies || {};
  if (deps["@angular/core"]) return "angular";
  if (deps["vue"] || deps["nativescript-vue"]) return "vue";
  if (deps["react"] || deps["react-nativescript"]) return "react";
  if (deps["svelte"] || deps["svelte-native"]) return "svelte";
  if (deps["solid-js"] || deps["solid-nativescript"]) return "solid";
  return "typescript";
}

async function performSwitch(target: "webpack" | "vite", flavor: string, s: any) {
  const pm = await getPackageManager();
  const installCmd = pm === "npm" ? "install" : "add";
  const uninstallCmd = pm === "npm" ? "uninstall" : "remove";
  const devFlag = pm === "yarn" ? "--dev" : "-D";

  // 1. Uninstall current bundler
  const current = target === "webpack" ? "vite" : "webpack";
  s.message(`Uninstalling @nativescript/${current}...`);
  await runCommand(pm, [uninstallCmd, `@nativescript/${current}`]);

  // 2. Install target bundler
  s.message(`Installing @nativescript/${target}...`);
  await runCommand(pm, [installCmd, `@nativescript/${target}`, devFlag]);

  // 3. Handle flavor specific vite config if switching to vite
  if (target === "vite") {
    const viteConfigPath = path.join(process.cwd(), "vite.config.ts");
    if (!existsSync(viteConfigPath)) {
      s.message(`Generating vite.config.ts for ${pc.cyan(flavor)}...`);
      const content = getViteConfigTemplate(flavor);
      writeFileSync(viteConfigPath, content);
    }

    // Update nativescript.config.ts
    updateNativeScriptConfig("vite", s);
  }

  // 4. Handle webpack.config.js if switching to webpack
  if (target === "webpack") {
    const webpackConfigPath = path.join(process.cwd(), "webpack.config.js");
    if (!existsSync(webpackConfigPath)) {
      s.message(`Generating default webpack.config.js...`);
      const content = `const webpack = require("@nativescript/webpack");\n\nmodule.exports = (env) => {\n\twebpack.init(env);\n\n\treturn webpack.resolveConfig();\n};\n`;
      writeFileSync(webpackConfigPath, content);
    }

    // Update nativescript.config.ts
    updateNativeScriptConfig("webpack", s);
  }
}

function backupProject(currentBundler: "webpack" | "vite") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(
    process.cwd(),
    ".nsforge",
    "backups",
    "bundler",
    currentBundler,
    timestamp
  );

  // Create directory structure
  mkdirSync(backupDir, { recursive: true });

  // Files to COPY
  const filesToCopy = ["package.json", "nativescript.config.ts"];
  for (const file of filesToCopy) {
    const src = path.join(process.cwd(), file);
    if (existsSync(src)) {
      copyFileSync(src, path.join(backupDir, file));
    }
  }

  // Files to CUT (MOVE)
  const filesToCut: string[] = [];
  if (currentBundler === "vite") {
    filesToCut.push("vite.config.ts");
    filesToCut.push("vite.config.js");
  } else if (currentBundler === "webpack") {
    filesToCut.push("webpack.config.js");
  }

  for (const file of filesToCut) {
    const src = path.join(process.cwd(), file);
    if (existsSync(src)) {
      renameSync(src, path.join(backupDir, file));
    }
  }
}

function getAvailableBackups(bundler: string): string[] {
  const backupsDir = path.join(process.cwd(), ".nsforge", "backups", "bundler", bundler);
  if (existsSync(backupsDir)) {
    return readdirSync(backupsDir).filter(f => existsSync(path.join(backupsDir, f)));
  }
  return [];
}

async function performRestore(target: "webpack" | "vite", timestamp: string, flavor: string, s: any) {
  const pm = await getPackageManager();
  const installCmd = pm === "npm" ? "install" : "add";
  const uninstallCmd = pm === "npm" ? "uninstall" : "remove";
  const devFlag = pm === "yarn" ? "--dev" : "-D";

  // 1. Uninstall current bundler
  const current = target === "webpack" ? "vite" : "webpack";
  s.message(`Uninstalling @nativescript/${current}...`);
  await runCommand(pm, [uninstallCmd, `@nativescript/${current}`]);

  // 2. Install target bundler
  s.message(`Installing @nativescript/${target}...`);
  await runCommand(pm, [installCmd, `@nativescript/${target}`, devFlag]);

  // 3. Restore files from backup
  s.message(`Copying files from backup...`);
  const backupDir = path.join(process.cwd(), ".nsforge", "backups", "bundler", target, timestamp);
  const files = readdirSync(backupDir);
  for (const file of files) {
    copyFileSync(path.join(backupDir, file), path.join(process.cwd(), file));
  }
}

function updateNativeScriptConfig(target: "webpack" | "vite", s: any) {
  const configPath = path.join(process.cwd(), "nativescript.config.ts");
  if (existsSync(configPath)) {
    let content = readFileSync(configPath, "utf-8");
    if (target === "vite") {
      // Remove webpackConfigPath if it exists
      if (content.includes("webpackConfigPath")) {
        s.message(`Cleaning up ${pc.yellow("nativescript.config.ts")} for Vite...`);
        // Matches webpackConfigPath: '...', or webpackConfigPath: "...", with optional trailing comma and spaces
        content = content.replace(/\s*webpackConfigPath:\s*['"].*['"],?\s*/g, "\n  ");
        writeFileSync(configPath, content);
      }
    }
  }
}


function getViteConfigTemplate(flavor: string): string {
  switch (flavor) {
    case "angular":
      return `import { defineConfig } from 'vite';\nimport { nativescriptVite } from '@nativescript/vite';\nimport { nativescriptAngular } from '@nativescript/angular/vite';\n\nexport default defineConfig({\n  plugins: [\n    nativescriptAngular(),\n    nativescriptVite(),\n  ],\n});\n`;
    case "vue":
      return `import { defineConfig } from 'vite';\nimport { nativescriptVite } from '@nativescript/vite';\nimport { nativescriptVue } from '@nativescript/vue/vite';\n\nexport default defineConfig({\n  plugins: [\n    nativescriptVue(),\n    nativescriptVite(),\n  ],\n});\n`;
    case "react":
      return `import { defineConfig } from 'vite';\nimport { nativescriptVite } from '@nativescript/vite';\nimport { nativescriptReact } from '@nativescript/react/vite';\n\nexport default defineConfig({\n  plugins: [\n    nativescriptReact(),\n    nativescriptVite(),\n  ],\n});\n`;
    case "svelte":
      return `import { defineConfig } from 'vite';\nimport { nativescriptVite } from '@nativescript/vite';\nimport { nativescriptSvelte } from '@nativescript/svelte/vite';\n\nexport default defineConfig({\n  plugins: [\n    nativescriptSvelte(),\n    nativescriptVite(),\n  ],\n});\n`;
    default:
      return `import { defineConfig } from 'vite';\nimport { nativescriptVite } from '@nativescript/vite';\n\nexport default defineConfig({\n  plugins: [nativescriptVite()],\n});\n`;
  }
}

async function getPackageManager(): Promise<string> {
  // Logic to detect PM, can reuse from pm.ts if exported or just check lockfiles
  if (existsSync(path.join(process.cwd(), "package-lock.json"))) return "npm";
  if (existsSync(path.join(process.cwd(), "yarn.lock"))) return "yarn";
  if (existsSync(path.join(process.cwd(), "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(process.cwd(), "bun.lockb"))) return "bun";
  return "npm";
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "ignore",
      shell: true,
    });

    const cleanup = setupProcessCleanup(child);

    child.on("close", (code) => {
      cleanup();
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}
