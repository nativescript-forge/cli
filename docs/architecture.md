# Architecture & Design Details

This document explains the technical architecture, design patterns, and internal workflows of the **NativeScript Forge CLI (`nsf`)**.

---

## 1. Command Delegation & Fallback Proxying

The CLI is built as an interactive wrapper around the standard NativeScript command-line tool `ns`. 

### The Wildcard Command Fallback
In [src/index.ts](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/index.ts), `nsf` uses `commander` to capture any inputs not explicitly registered as subcommands:

```typescript
program.on("command:*", (operands) => {
  const args = [...operands, ...program.args.slice(operands.length)];
  const child = spawn("ns", args, { stdio: "inherit", shell: true });
  setupProcessCleanup(child);
});
```

*   **Workflow**:
    1.  If you type `nsf run`, it executes the custom interactive builder in `src/commands/run.ts`.
    2.  If you type `nsf devices` (which is not a registered `nsf` command), `commander` catches it under `command:*`.
    3.  `nsf` immediately spawns a child process invoking `ns devices`, passing the input/output directly back to your terminal window.

---

The registered `platform` command uses its own interactive handler: operation selection, platform selection (except List), and runtime version selection (Add/Update). Direct subcommands such as `nsf platform add android` also use this handler rather than the wildcard fallback. See [PLATFORM mapping](../command-mapping/PLATFORM.md).

## 2. Smart Config Backup & Sync System

When switching bundlers (Vite ↔ Webpack) or altering configuration fields, the CLI utilizes a strict backup protocol to ensure code is never lost or corrupted.

### Directory Configuration
- Backups are written to the workspace local `.nsforge/backups/bundler/` directory.
- Folders are timestamped so users can roll back to exact points in time.

### Backup Process Flow
When executing `nsf bundler`:
1.  **Backup**:
    - Copies `package.json` and `nativescript.config.ts` into the backup subdirectory.
    - **Moves** (does not just copy) the existing config file (`webpack.config.js` or `vite.config.ts`) into the backup folder to avoid compilation conflicts at the project root.
2.  **Configuration Writes**:
    - Generates a new `vite.config.ts` or `webpack.config.js` in the root.
    - Rewrites `nativescript.config.ts` (e.g., stripping Webpack-specific paths if moving to Vite).
    - Updates dependencies in `package.json`.
3.  **Restoration**:
    - If backups exist in `.nsforge`, the menu prompts the user with a "Restore Config from Backup" option.
    - Restoring reverses the backup process by copying files back from the selected timestamp directory to the root.

---

## 3. Process Lifecycle & Zombie Mitigation

Spawning CLI wrappers that run long-lived processes (such as `ns run` or `ns debug`) can leave child processes running in the background when the parent process exits abruptly.

### Process Cleanup (`src/utils/process.ts`)
The `setupProcessCleanup` helper utility attaches event listeners to key OS signals:
- **`exit`**, **`SIGINT`** (Ctrl+C), **`SIGTERM`**, and **`SIGHUP`**.
- Upon receiving a termination signal, `nsf` intercepts the event, signals the spawned child process to terminate (`child.kill()`), and then exits cleanly.
- This prevents child compilation and device emulator watchers from spawning as orphaned background threads.

---

## 4. UI Rendering & Theme Customization

To ensure an elegant look and feel, `nsf` configures console colors and custom ascii outputs.

- **Theme Engine (`src/utils/theme.ts`)**: Sets consistent theme styling markers.
- **Picocolors (`picocolors`)**: Colors help text, warning alerts, and progress states.
- **ASCII Art**: Renders a large branding banner upon execution of the help or menu pages.

## Agent Skill Installation

`nsf skill` is independent of NativeScript CLI. It opens List/Guide followed by curated collection selection. List shows purpose, capabilities, repository details, and confirmation before launching the interactive skills installer. Guide shows collection-specific usage and examples without starting an installer. Both views use metadata from `src/utils/skill-sources.ts`; only curated source IDs are accepted. Upstream handles skill discovery, agent selection, scope, installation method, and writes. Terminal input/output is inherited; shared cleanup handles Ctrl+C. See [SKILL mapping](../command-mapping/SKILL.md).
