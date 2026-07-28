# Project Structure

This document details the file structure of the **NativeScript Forge CLI (`nsf`)** project. It outlines the directories, configuration files, and components that make up the CLI utility.

---

## Directory Overview

The root of the repository is structured as follows:

```
nativescript-forge-cli/
├── .agents/                    # Workspace agent configurations
├── assets/                     # Graphical assets and branding icons
├── bin/                        # Binary entry points
│   └── nsf                     # Shell launcher script
├── command-mapping/            # Markdown specifications for command mappings
│   ├── BUILD.md
│   ├── BUNDLER.md
│   └── ...
├── dist/                       # Output of compilation (JavaScript)
├── docs/                       # Project documentation
│   ├── README.md
│   ├── project_structure.md
│   ├── commands.md
│   ├── architecture.md
│   └── development_guide.md
├── node_modules/               # Installed npm dependencies
└── src/                        # CLI TypeScript source files
    ├── index.ts                # Main CLI entry point
    ├── commands/               # CLI commands implementations
    │   ├── build.ts
    │   ├── bundler.ts
    │   └── ...
    └── utils/                  # Common utilities
        ├── constants.ts
        ├── process.ts
        ├── theme.ts
        └── ui.ts
```

---

## Key Files & Folders

### 🚀 Binary Launcher
- **[`bin/nsf`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/bin/nsf)**:
  A lightweight shell script that executes the compiled `dist/index.js` file using Node.js. When users install the package globally, npm binds the `nsf` executable command to this file.

### 📝 Source Directory (`src/`)

- **[`src/index.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/index.ts)**:
  The master entry point of the CLI application. It utilizes `commander` to register each command name, describe options, define help banners, and map action inputs to corresponding files in `src/commands/`. It also implements the fallback wildcard command handler (`program.on("command:*")`) which forwards unknown commands directly to the NativeScript CLI (`ns`).

- **`src/commands/`**:
  Contains the business logic for each custom, interactive sub-command.
  - **[`build.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/build.ts)**: Orchestrates APK/AAB build presets (Development, Production, Custom) and prompts for Android signing keystores.
  - **[`bundler.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/bundler.ts)**: Automates transitioning between Webpack and Vite.
  - **[`create.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/create.ts)**: Guided step-by-step project scaffolding using official NativeScript template repositories.
  - **[`debug.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/debug.ts)**: Interactive runner for the debugging process.
  - **[`doctor.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/doctor.ts)**: Invokes environment diagnostics.
  - **[`info.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/info.ts)**: Displays platform versioning and OS configuration details.
  - **[`menu.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/menu.ts)**: Generates the main interactive dashboard terminal menu.
  - **[`native.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/native.ts)**: Assists in adding platform-native code (Swift, Kotlin, etc.) to the project.
  - **[`plugin.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/plugin.ts)**: Commands for listing, adding, removing, and creating plugins.
  - **[`pm.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/pm.ts)**: Gets or sets the preferred package manager (`npm`, `yarn`, `pnpm`, `bun`).
  - **[`proxy.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/proxy.ts)**: Configures HTTP proxy settings for network environments.
  - **[`resources.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/resources.ts)**: Automated generator for icons and splash screens.
  - **[`run.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/commands/run.ts)**: Guides the process of deploying the app to connected simulators or physical devices.

- **`src/utils/`**:
  Reusable utility functions.
  - **[`constants.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/utils/constants.ts)**: Holds the structural maps for Mobile and VisionOS platforms, flavors (Vue, Svelte, React, Angular, TS, JS), and their official template URLs.
  - **[`process.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/utils/process.ts)**: Safely spawns background child processes, listens to termination events, and cleans up zombie processes.
  - **[`theme.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/utils/theme.ts)** & **[`ui.ts`](file:///c:/Users/dyazi/DataDisk/projects/kang-cahya/github/nsforge-cli/src/utils/ui.ts)**: Set the coloring rules, prompt indicators, and custom formats to offer an elegant terminal user interface.

---

## Configuration Files

- **`package.json`**:
  Declares CLI commands, build targets, dependencies (`@clack/prompts`, `commander`), and dev dependencies.
- **`tsconfig.json`**:
  Configures the TypeScript compiler (`tsc`) options.
- **`tsup.config.json`**:
  Configures `tsup` for rapid ESM/CommonJS bundling, producing the outputs inside the `dist` folder.
- **`COMMANDS.md`**:
  A file summarizing the general usage of commands (intended for end-users).
- **`command-mapping/`**:
  Maps interactive `nsf` selections to their exact CLI terminal representation for `ns`. Used to document how UI selections translate to native flags.
