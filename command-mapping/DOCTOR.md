# DOCTOR Command Mapping

This document maps the `nsf doctor` command to its corresponding NativeScript CLI (`ns`) command.

## Overview

The `nsf doctor` command checks your local environment for potential issues that might prevent NativeScript from working correctly.

## Command Mappings

### 1. Check Environment

| Interactive Command | CLI Mapping | Description |
| :--- | :--- | :--- |
| **nsf doctor** | `ns doctor` | Scans the local environment for configuration errors and dependency issues. |

---

## Implementation Details

- **File:** `src/commands/doctor.ts`
- **Behavior:** This command executes `ns doctor` and displays the output in a structured format with a progress spinner.
- **Source:** Based on `ns doctor --help`.
