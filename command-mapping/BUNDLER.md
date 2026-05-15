# Bundler Command Mapping

This document maps the `nsf bundler` (and alias `nsf app-bundle`) command to its corresponding NativeScript CLI (`ns`) and system operations.

## Overview

The `nsf bundler` command automates the process of switching between Webpack and Vite. Unlike most `nsf` commands that simply wrap `ns` flags, this command performs complex file operations, dependency management, and configuration synchronization.

## Command Mappings

| Interactive Action | Underlying Operations | Description |
| :--- | :--- | :--- |
| **Switch to Vite** | `<pm> uninstall @nativescript/webpack` <br> `<pm> install @nativescript/vite -D` | Removes Webpack and installs Vite as a dev dependency. |
| **Switch to Webpack** | `<pm> uninstall @nativescript/vite` <br> `<pm> install @nativescript/webpack -D` | Removes Vite and installs Webpack as a dev dependency. |
| **Restore Config** | `copy <backup_path> <project_root>` | Restores a specific configuration snapshot from `.nsforge`. |
| **Clean Project** | `ns clean` | Removes platform build artifacts (highly recommended after switching). |

---

## Implementation Details

- **File:** `src/commands/bundler.ts`
- **Logic Flow**:
    1. **Backup**: Before any change, copies `package.json` and `nativescript.config.ts`, and moves the active bundler config to `.nsforge/backups/bundler/<bundler>/<timestamp>/`.
    2. **Dependency Management**: Uses the project's detected package manager to swap `@nativescript/webpack` and `@nativescript/vite`.
    3. **Configuration Generation**: 
        - If missing, generates `vite.config.ts` based on the detected flavor (Angular, Vue, React, Svelte, or TS).
        - If missing, generates a standard `webpack.config.js`.
    4. **Config Cleanup**: If switching to Vite, it uses regex to strip `webpackConfigPath` from `nativescript.config.ts` to prevent build errors.
    5. **Post-Process**: Offers an interactive prompt to run `ns clean` to ensure environment consistency.

## Configuration Templates

The CLI uses internal templates for `vite.config.ts` depending on the detected framework flavor:

- **Angular**: Uses `@nativescript/angular/vite` plugin.
- **Vue**: Uses `@nativescript/vue/vite` plugin.
- **React**: Uses `@nativescript/react/vite` plugin.
- **Svelte**: Uses `@nativescript/svelte/vite` plugin.
- **TypeScript**: Standard `@nativescript/vite` plugin.

---

## References

- [NativeScript Configuration](https://docs.nativescript.org/configuration/nativescript)
- [Vite Configuration in NativeScript](https://docs.nativescript.org/configuration/vite)
- [Webpack Configuration in NativeScript](https://docs.nativescript.org/configuration/webpack)
