# RUN Command Mapping

This document maps the `nsf run` interactive command to its corresponding NativeScript CLI (`ns`) commands and flags.

## Overview

The `nsf run` command provides an interactive way to run your NativeScript project on a connected device or emulator.

## Command Mappings

### 1. Platforms
- **Android**: `ns run android`
- **iOS**: `ns run ios`
- **VisionOS**: `ns run visionos`

---

### 2. Options Mapping

| Interactive Option | CLI Flag | Description |
| :--- | :--- | :--- |
| **Release build** | `--release` | Produces a production-ready build. |
| **Just launch** | `--justlaunch` | Launches the app without terminal output. |
| **Select device** | `--device <ID>` | Targets a specific device or emulator. |
| **Disable HMR** | `--no-hmr` | Disables Hot Module Replacement. |
| **Android App Bundle** | `--aab` | Builds/Deploys .aab for Android. |
| **Force check** | `--force` | Skips compatibility checks. |
| **Enable AOT** | `--env.aot` | Creates Ahead-Of-Time build. |
| **Enable Uglify** | `--env.uglify` | Basic obfuscation and smaller size. |
| **Enable V8 Snapshot** | `--env.snapshot` | Creates a V8 Snapshot. |
| **Enable CommonJS** | `--env.commonjs` | Forces CommonJS format (fixes ESM compatibility issues). |
| **Other Environment flags...** | `--env.*` | Passes other custom environment variables. |

---

### 3. Device Selection Flow
1. **Fetch**: `ns device <platform> --available-devices`
2. **Select**: User picks from identified devices.
3. **Manual**: Fallback to manual ID input if needed.

---

## Implementation Details

- **File:** `src/commands/run.ts`
- **Behavior:** This command allows multi-selection of run options and provides an interactive device picker.
- **Source:** Based on `ns run --help`.
