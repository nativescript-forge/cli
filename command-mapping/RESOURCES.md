# RESOURCES Command Mapping

This document maps the `nsf resources` interactive command to its corresponding NativeScript CLI (`ns`) commands for generating app assets.

## Overview

The `nsf resources` command provides a guided process to generate platform-specific icons and splash screens from a single source image.

## Command Mappings

### 1. Resource Types

| Interactive Option | CLI Command | Description |
| :--- | :--- | :--- |
| **Icon** | `ns resources generate icons <Path>` | Generates app icons for all supported platforms. |
| **Splashscreen** | `ns resources generate splashes <Path> --background <Color>` | Generates splash screens with an optional background color. |

---

### 2. Options Detail

- **Image Path**: The absolute path to the source image (recommended 1080x1080px).
- **Background Color**: Hex color code (e.g., `#FFFFFF`) used for splash screen generation.

---

## Implementation Details

- **File:** `src/commands/resources.ts`
- **Behavior:** This command guides the user through selecting the resource type, providing the image path, and specifying an optional background color for splash screens.
- **Source:** Based on `ns resources --help`.
