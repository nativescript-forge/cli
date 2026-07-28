# MIGRATE Command Mapping

This document maps the `nsf migrate` command to its corresponding NativeScript CLI (`ns`) command.

## Overview

The `nsf migrate` command migrates your project's configuration files, dependencies, and structure to be compatible with the currently installed NativeScript CLI version.

## Command Mappings

### 1. Migrate Project

| Interactive Command | CLI Mapping | Description |
| :--- | :--- | :--- |
| **nsf migrate** | `ns migrate` | Migrates the project configurations to match the installed CLI version. |

---

## Implementation Details

- **File:** `src/commands/migrate.ts`
- **Behavior:** Prompts the user to confirm since the command modifies configuration files and requires a clean Git environment. Runs `ns migrate` with a progress spinner.
- **Source:** Based on `ns migrate --help`.
