# CLEAN Command Mapping

This document maps the `nsf clean` command to its corresponding NativeScript CLI (`ns`) command.

## Overview

The `nsf clean` command clears local build files, platform folders, and dependency caches to resolve build or sync anomalies.

## Command Mappings

### 1. Clean Project

| Interactive Command | CLI Mapping | Description |
| :--- | :--- | :--- |
| **nsf clean** | `ns clean` | Cleans up the `platforms`, `hooks`, and `node_modules` directories in the project root. |

---

## Implementation Details

- **File:** `src/commands/clean.ts`
- **Behavior:** Asks the user for confirmation and runs the `ns clean` command with a progress spinner.
- **Source:** Based on `ns clean --help`.
