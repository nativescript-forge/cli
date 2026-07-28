# NativeScript Forge CLI Documentation

Welcome to the official documentation for **NativeScript Forge CLI (`nsf`)**. 

`nsf` is an opinionated interactive wrapper around the standard [NativeScript CLI (`ns`)](https://github.com/NativeScript/nativescript-cli). It provides developers with a highly guided, visually pleasant, and interactive command-line workflow to build NativeScript applications.

---

## Table of Contents

### 1. 📂 [Project Structure](project_structure.md)
Detailed breakdown of the codebase organization, folders, key files, and entry points.

### 2. 💻 [Commands Reference](commands.md)
A comprehensive guide to all interactive commands supported by `nsf`, including step-by-step processes, CLI flags, and build presets.

### 3. 🏗️ [Architecture & Design Details](architecture.md)
Deep dive into the inner workings of `nsf`, including the CLI delegation/proxy mechanism, the config backup system, and the process lifecycle manager.

### 4. 🛠️ [Development & Contribution Guide](development_guide.md)
Instructions on setting up a local development environment, building the project, coding standards, and publishing guidelines.

---

## Core Features

- 🌟 **Main Menu (`nsf menu` / `nsf`)**: Access all features via an elegant interactive terminal dashboard.
- ⚙️ **Guided Configuration**: Prompts that simplify complex processes like building for Android with signing keystores or switching bundlers (Vite/Webpack).
- 🔄 **Safe Config Sync & Backups**: Automated config backups when switching bundlers or default package managers.
- 📦 **Fallback Proxying**: Any standard NativeScript command not explicitly overridden by `nsf` is transparently passed to the underlying `ns` CLI.
