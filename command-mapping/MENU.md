# MENU Command Mapping

This document maps the `nsf menu` (or the default `nsf` command) to the interactive command selection process.

## Overview

The `nsf menu` command provides a central entry point for the NativeScript Forge CLI, allowing users to select any available command from a visual list.

## Command Mappings

### 1. Main Menu Options

| Option | Executed Command | Description |
| :--- | :--- | :--- |
| **Create** | `nsf create` | Starts the project creation wizard. |
| **Run** | `nsf run` | Starts the interactive run process. |
| **Build** | `nsf build` | Starts the interactive build process. |
| **Resources** | `nsf resources` | Opens the asset generation menu. |
| **Proxy** | `nsf proxy` | Opens the proxy configuration menu. |
| **Doctor** | `nsf doctor` | Runs the environment health check. |
| **Info** | `nsf info` | Displays system and environment info. |

---

## Implementation Details

- **File:** `src/commands/menu.ts`
- **Behavior:** Uses `@clack/prompts` to display a selection menu. Upon selection, it calls the corresponding command's implementation function directly.
- **Default Action:** This menu is automatically triggered when `nsf` is executed without any arguments.
