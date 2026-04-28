# PM Command Mapping

This document maps the `nsf pm` command to its corresponding NativeScript CLI (`ns`) command.

## Overview

The `nsf pm` command manages the default package manager used by the NativeScript CLI. It allows you to view the current configuration and interactively select a new default package manager.

## Command Mappings

### 1. Get Default Package Manager

| Interactive Command | CLI Mapping | Description |
| :--- | :--- | :--- |
| **nsf pm get** | `ns package-manager get` | Displays the current default package manager. |

### 2. Set Default Package Manager

| Interactive Command | CLI Mapping | Description |
| :--- | :--- | :--- |
| **nsf pm set** | `ns package-manager set <PM_NAME>` | Interactively scans and allows selection of an available package manager. |

---

## Implementation Details

- **File:** `src/commands/pm.ts`
- **Behavior:** 
    - `get`: Executes `ns package-manager get` and displays the result.
    - `set`: Scans for available package managers (`npm`, `yarn`, `pnpm`, `bun`) on the system, presents them as a list for the user to choose from, and then executes `ns package-manager set <selection>`.
- **Source:** Based on `ns package-manager --help`.
