# DEBUG Command Mapping

This document maps the `nsf debug` interactive command to its corresponding NativeScript CLI (`ns`) commands and flags.

## Overview

The `nsf debug` command provides a guided process to debug your NativeScript project for a specific platform, launching a debugging session with Chrome DevTools.

## Command Mappings

### 1. Platforms
- **Android**: `ns debug android`
- **iOS**: `ns debug ios`

---

### 2. Options Mapping

| Interactive Option | CLI Flag | Description |
| :--- | :--- | :--- |
| **Debug Break** | `--debug-brk` | Stops execution at the first JavaScript line. |
| **Attach only** | `--start` | Attaches the debug tools to an already deployed app. |
| **Select device** | `--device <ID>` | Specifies a connected target device/identifier. |
| **Disable Watch** | `--no-watch` | Changes in your code will not be livesynced. |
| **Clean build** | `--clean` | Forces rebuilding the native application. |
| **Custom Timeout** | `--timeout <N>` | Seconds to wait for the debugger to boot (default 90). |
| **Enable AOT** | `--env.aot` | Creates Ahead-Of-Time build. |
| **Enable Uglify** | `--env.uglify` | Basic obfuscation and smaller size. |
| **Enable V8 Snapshot** | `--env.snapshot` | Creates a V8 Snapshot. |
| **Enable CommonJS** | `--env.commonjs` | Forces CommonJS format (fixes ESM compatibility issues). |
| **Other Environment flags...** | `--env.*` | Passes other custom environment variables. |

---

## Implementation Details

- **File:** `src/commands/debug.ts`
- **Behavior:** This command wraps the NativeScript debug process with interactive options for platform selection, device picking, and debugging flags.
- **Source:** Based on `ns debug --help`.
