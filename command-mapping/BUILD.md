# BUILD Command Mapping

This document maps the `nsf build` interactive command to its corresponding NativeScript CLI (`ns`) commands and flags.

## Overview

The `nsf build` command provides a guided process to build your NativeScript project for a specific platform, producing an application package (APK or AAB).

## Command Mappings

### 1. Platforms
- **Android**: `ns build android`
- ~~**iOS**: `ns build ios`~~ (Not supported yet)
- ~~**VisionOS**: `ns build visionos`~~ (Not supported yet)

---

### 2. Options Mapping

| Interactive Option | CLI Flag | Description |
| :--- | :--- | :--- |
| **Release build** | `--release` | Produces a production-ready build with optimizations. |
| **Just launch** | `--justlaunch` | Does not print application output in the console. |
| **Select device** | `--device <ID>` | Specifies a connected target device/identifier. |
| **Enable HMR** | `--hmr` | Enables Hot Module Replacement. |
| **Android App Bundle** | `--aab` | Builds/Deploys .aab for Android. |
| **Force check** | `--force` | Skips compatibility checks and forces dependency installation. |
| **Enable AOT** | `--env.aot` | Creates Ahead-Of-Time build. |
| **Enable Uglify** | `--env.uglify` | Basic obfuscation and smaller size. |
| **Enable V8 Snapshot** | `--env.snapshot` | Creates a V8 Snapshot. |
| **Enable CommonJS** | `--env.commonjs` | Forces CommonJS format (fixes ESM compatibility issues). |
| **Other Environment flags...** | `--env.*` | Passes other custom environment variables. |

---

### 3. Environment Flags Detail
- `--env.aot`: Creates Ahead-Of-Time build (Angular).
- `--env.snapshot`: Creates a V8 Snapshot (Android Release).
- `--env.compileSnapshot`: Compiles static assets from snapshot into `.so`.
- `--env.uglify`: Basic obfuscation and smaller size.
- `--env.commonjs`: Forces CommonJS format (fixes ESM compatibility issues for legacy plugins).
- `--env.report`: Creates Webpack report.
- `--env.sourceMap`: Inline source maps.
- `--env.hiddenSourceMap`: Source maps in root (Crashlytics).

---

## Implementation Details

- **File:** `src/commands/build.ts`
- **Behavior:** This command wraps the NativeScript build process with interactive presets (PRODUCTION, DEVELOPMENT, CUSTOM).
- **Source:** Based on `ns build --help`.
