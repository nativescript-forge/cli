# Commands Reference

This document provides a comprehensive reference for all interactive commands supported by the **NativeScript Forge CLI (`nsf`)**.

---

## Interactive Controls

Across all menus and prompts, use these standard terminal navigation inputs:
*   **Arrow Keys (↑/↓)**: Navigate items in lists.
*   **Space**: Check/uncheck options in multi-select checkboxes.
*   **Enter**: Confirm selection and proceed.
*   **◀ Go Back**: Select this in submenus to step backward.
*   **Ctrl+C**: Cancel the current command and exit safely.

---

## Command Catalog

### 1. `nsf menu` (or just `nsf`)
Opens the main dashboard. It provides a visual menu listing all other commands.
*   **Usage**: `nsf menu` or `nsf`
*   **Interactive Flow**: Select a command from the list, and the CLI will instantly run that subcommand.

### 2. `nsf create`
Guided wizard to generate a new NativeScript project.
*   **Usage**: `nsf create` or `nsf create [appName]`
*   **Prompts**:
    1.  **Project Name**: The directory and app name (skipped if `appName` is provided as an argument).
    2.  **Platform**: Mobile (Android/iOS) or VisionOS.
    3.  **Flavor**: Choose a frontend library (TypeScript, JavaScript, Angular, React, Vue, Svelte, Solid).
    4.  **Template**: Choose from template options (Blank, Hello World, Drawer Navigation, Master Detail, Tab Navigation) depending on the flavor.
*   **Equivalent Command**: Spawns `ns create <appName> --template <template-repository>`.

### 3. `nsf build`
Builds a binary package (APK or AAB) for Android.
*   **Usage**: `nsf build`
*   **Build Presets**:
    *   **PRODUCTION**: Releases with signing and optimization.
        *   Prompts for: Keystore Path, Keystore Password, Key Alias, Key Alias Password.
        *   Asks for build type: APK or AAB.
        *   Allows specifying a destination to copy the output file.
        *   Command: `ns clean && ns build android --release --key-store-path <path> --key-store-password <pass> ...`
    *   **DEVELOPMENT**: Builds a debug package.
        *   Asks for output type (APK/AAB) and output directory.
        *   Command: `ns clean && ns build android`
    *   **CUSTOM**: Provides options to manually toggle individual command flags:
        *   `--release`, `--justlaunch`, `--device`, `--hmr`, `--aab`, `--force`, `--env.uglify`, `--env.aot`, `--env.snapshot`, etc.

### 4. `nsf clean`
Cleans up build artifacts and caches.
*   **Usage**: `nsf clean`
*   **Behavior**:
    1.  Shows information warning details on files being cleaned (e.g. `node_modules`, `platforms`, `hooks`).
    2.  Prompts for confirmation to proceed.
    3.  Runs `ns clean` with a progress spinner.

### 5. `nsf resources`
Generates splash screens and icons from a source graphic.
*   **Usage**: `nsf resources`
*   **Prompts**:
    1.  **Type**: Icon or Splashscreen.
    2.  **Source Path**: Absolute path to a high-res image (1080x1080px recommended).
    3.  **Background Color**: (Splashscreen only) Background fill hex code (e.g., `#FFFFFF`).
*   **Equivalent Commands**:
    *   Icon: `ns resources generate icons <source_image_path>`
    *   Splash: `ns resources generate splashes <source_image_path> --background <color_code>`

### 5. `nsf plugin`
Integrates project plugins or manages plugin development.
*   **Usage**: `nsf plugin`
*   **Prompts & Subcategories**:
    *   **Project Management**:
        *   *List*: Lists installed plugins. (`ns plugin`)
        *   *Add*: Installs a new plugin. (`ns plugin add <name>`)
        *   *Remove*: Uninstalls a plugin. (`ns plugin remove <name>`)
        *   *Update*: Updates a plugin. (`ns plugin update <name>`)
    *   **Plugin Development**:
        *   *Build*: Builds the Android components of a plugin. (`ns plugin build`)
        *   *Create*: Scaffolds a new plugin repository. (`ns plugin create <name>`)

### 6. `nsf proxy`
Configures network proxy parameters.
*   **Usage**: `nsf proxy`
*   **Options**:
    *   *Show*: Prints current proxy values.
    *   *Set*: Prompts for Proxy URL, Username, and Password (Windows-only credentials). Automatically attaches `--insecure` to bypass certificate verification.
    *   *Clear*: Clears proxy configuration.

### 7. `nsf native`
Imports native Swift/Kotlin/Java/Objective-C code and reviews JavaScript bindings usage (introduced in NativeScript 8.8).
*   **Usage**: `nsf native`
*   **Options**:
    *   *Add Native Code*: Adds native files of specific languages (Swift, Objective-C, Kotlin, Java) and Class Names.
    *   *Native Usage*: Scans project native files and prints usage syntax examples on how to consume the classes from JS/TS.

### 8. `nsf pm`
Manages the global or workspace default package manager.
*   **Usage**: `nsf pm get` or `nsf pm set`
*   **Actions**:
    *   `get`: Displays active package manager (`ns package-manager get`).
    *   `set`: Scans the system path for `npm`, `yarn`, `pnpm`, and `bun`, offering available choices. If `pnpm` is chosen, it automatically sets `node-linker=hoisted` inside `.npmrc` to satisfy NativeScript flatness requirements.

### 9. `nsf bundler` (alias `app-bundle`)
Switches the module compiler configuration between Webpack (Classic) and Vite (Modern).
*   **Usage**: `nsf bundler` or `nsf app-bundle`
*   **Flow**:
    1.  Detects the existing configuration.
    2.  Creates a backup of configuration files under `.nsforge/backups/bundler/`.
    3.  Switches configuration settings in `nativescript.config.ts` and configures `webpack.config.js` or `vite.config.ts`.
    4.  Offers restoration from previous backups if found.
    5.  Prompts to clean the workspace (`ns clean`) to prevent device caching issues.

### 10. `nsf run` & `nsf debug`
Runs or debugs applications on selected platforms.
*   **Usage**: `nsf run` or `nsf debug`
*   **Prompts**: Select Target Platform (Android, iOS, VisionOS).
*   **Note**: Because termination on terminal wrappers can occasionally leave processes running in the background, it is recommended to run `ns run <platform>` directly if CLI hooks fail to exit.

### 11. `nsf update`
Updates project dependencies, runtimes, and core cross-platform modules.
*   **Usage**: `nsf update`
*   **Options**:
    *   *Latest Stable*: Updates to the latest stable release (`ns update`).
    *   *Next Release*: Updates to the latest pre-release/preview release (`ns update next`).
    *   *Specific Version*: Prompt to input a target version string (`ns update <version>`).
*   **Post-Update Action**: Prompts you to run `ns clean` to clean up cached build resources.

### 12. `nsf migrate`
Migrates project configuration files and dependencies to match the installed NativeScript CLI version.
*   **Usage**: `nsf migrate`
*   **Flow**:
    1.  Shows a warning that migration modifies files and requires a clean Git environment.
    2.  Prompts for confirmation to proceed.
    3.  Runs `ns migrate` with a progress spinner.
*   **Post-Migration Action**: Prompts you to run `ns clean` to clean up cached build resources.
