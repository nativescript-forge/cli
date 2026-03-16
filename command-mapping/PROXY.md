# PROXY Command Mapping

This document maps the `nsf proxy` interactive command to its corresponding NativeScript CLI (`ns`) commands.

## Overview

The `nsf proxy` command provides an interactive way to manage proxy settings for the NativeScript CLI. It delegates the actual configuration to the `ns proxy` command suite.

## Command Mappings

### 1. Operations

| Interactive Option | CLI Command | Description |
| :--- | :--- | :--- |
| **Show** | `ns proxy` | Displays the current proxy configuration. |
| **Set** | `ns proxy set <Url> [<User> <Pass>] --insecure` | Configures a new proxy URL and optional credentials. |
| **Clear** | `ns proxy clear` | Removes the current proxy settings. |

---

### 2. Set Proxy Options

- **Proxy URL**: The endpoint for the proxy server.
- **Credentials** (Optional): Username and password for authentication (Windows only).
- **Flag `--insecure`**: Always appended to bypass SSL certificate validation.

---

## Implementation Details

- **File:** `src/commands/proxy.ts`
- **Behavior:** This command wraps proxy management with interactive prompts and platform-specific checks.
- **Platform Compatibility:** Credential support (username/password) is only available on Windows systems.
- **Source:** Based on `ns proxy --help`.
