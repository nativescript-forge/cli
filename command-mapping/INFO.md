# INFO Command Mapping

This document maps the `nsf info` command to its corresponding NativeScript CLI (`ns`) command.

## Overview

The `nsf info` command displays detailed information about your current environment, including OS, Node.js version, and installed NativeScript components.

## Command Mappings

### 1. Environment Information

| Interactive Command | CLI Mapping | Description |
| :--- | :--- | :--- |
| **nsf info** | `ns info` | Displays current OS, Node, and CLI environment details. |

---

## Implementation Details

- **File:** `src/commands/info.ts`
- **Behavior:** This command executes `ns info` and displays the output in a structured format with a progress spinner.
- **Source:** Based on `ns info --help`.
