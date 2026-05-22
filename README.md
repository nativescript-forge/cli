<div>
  <img src="https://raw.githubusercontent.com/nativescript-forge/gui-app/main/public/nsf-dark-io.svg" alt="NativeScript Forge Icon" width="128" />
</div>

# NativeScript Forge CLI (nsf)

[![npm version](https://img.shields.io/npm/v/@nativescript-forge/cli.svg?style=flat-square)](https://www.npmjs.com/package/@nativescript-forge/cli)
[![npm license](https://img.shields.io/npm/l/@nativescript-forge/cli.svg?style=flat-square)](https://www.npmjs.com/package/@nativescript-forge/cli)
[![npm downloads](https://img.shields.io/npm/dt/@nativescript-forge/cli.svg?style=flat-square)](https://www.npmjs.com/package/@nativescript-forge/cli)

An opinionated interactive wrapper around the NativeScript CLI, designed to streamline your development workflow with a beautiful and intuitive interface.

## Overview

**_NativeScript Forge CLI (nsf)_** is a wrapper around the standard [NativeScript CLI](https://github.com/NativeScript/nativescript-cli) that provides a more guided and interactive experience for common tasks, starting with project creation. It works just like the usual **`ns`** command, but by simply adding the letter **`f`** it becomes **`nsf`**, giving developers a more visual and user-friendly CLI workflow. This tool also serves as the command-line counterpart of the NativeScript Forge GUI App (https://github.com/nativescript-forge/gui-app
).

## Installation

```bash
npm install -g @nativescript-forge/cli
```

## Usage

You can use the `nsf` command followed by any supported NativeScript action.

- **Main Menu**: Run `nsf menu` to see all available interactive commands in a beautiful list.
- **Direct Command**: Run `nsf <command>` (e.g., `nsf create`, `nsf run`) to jump directly into a specific task.
- **Help**: Run `nsf` without arguments to see the standard help information.

## Navigation Guide

The NativeScript Forge CLI is fully interactive. Across all commands, use the following controls to navigate:

- **Arrow Keys (↑/↓)**: Navigate through options in a list.
- **Space**: Select or unselect options in multiselect (checkbox) menus.
- **Enter**: Confirm your selection and proceed.
- **◀ Go Back**: Select this option in menus to return to the previous step or back to the main menu.
- **Ctrl+C**: Cancel the current operation or exit the CLI safely.


## Documentation

For detailed command descriptions, options, and advanced usage, see: **[Full Commands Documentation](COMMANDS.md)**

---

<div align="center">
  <p><i>Built with ❤️ for the NativeScript Community</i></p>
</div>
