# UPDATE Command Mapping

This document maps the `nsf update` command to its corresponding NativeScript CLI (`ns`) command.

## Overview

The `nsf update` command helps you update project dependencies, cross-platform modules, and runtimes interactively.

## Command Mappings

### 1. Update Project Dependencies

| Interactive Option | CLI Mapping | Description |
| :--- | :--- | :--- |
| **Latest** | `ns update` | Updates dependencies to the latest stable version. |
| **Next** | `ns update next` | Updates dependencies to the latest pre-release/preview version. |
| **Specific version** | `ns update <version>` | Updates dependencies to a specific version number. |

---

## Implementation Details

- **File:** `src/commands/update.ts`
- **Behavior:** Prompts the user to select the version type (latest, next, or specific version) and executes the corresponding `ns update` command with a progress spinner.
- **Source:** Based on `ns update --help`.
