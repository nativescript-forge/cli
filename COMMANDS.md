# Commands Documentation

Detailed documentation for all NativeScript Forge CLI (`nsf`) commands.

> [!NOTE]
> **NativeScript CLI Fallback**
> You can run basic commands available in `ns` using `nsf`. If a command is not natively implemented in `nsf`, it will automatically delegate to the NativeScript CLI (`ns`). If the command is not supported by either `nsf` or `ns`, an error will occur.

## Table of Contents

- [nsf menu](#nsf-menu)
- [nsf create](#nsf-create)
- [nsf build](#nsf-build)
- [nsf resources](#nsf-resources)
- [nsf plugin](#nsf-plugin)
- [nsf proxy](#nsf-proxy)
- [nsf native](#nsf-native)
- [nsf doctor](#nsf-doctor)
- [nsf info](#nsf-info)
- [nsf pm](#nsf-pm)
- [nsf bundler](#nsf-bundler)
- [Development Commands (Run & Debug)](#development-commands-run--debug)

---

## nsf menu

The main interactive entry point for NativeScript Forge. It allows you to select and execute any available command from a visual list.

> [!TIP]
> **Default Behavior**
> Running `nsf` without any arguments will automatically open the main menu.

### Usage

```bash
nsf
```

or

```bash
nsf menu
```

---

## nsf create

Create a new NativeScript project with an interactive, guided process.

### Usage

```bash
nsf create
```

or

```bash
nsf create [appName]
```

### Process

1. **Application Name**: Enter the name for your new project.
2. **Platform Selection**:
   - **Mobile**: Targets Android and iOS.
   - **VisionOS**: Targets Apple Vision Pro.
3. **Flavor Selection**:
   - JavaScript, TypeScript, Angular, React, Solid, Svelte, Vue.
4. **Template Selection**:
   - Choose from various templates like Blank, Drawer Navigation, Tab Navigation, Master-Detail, or Hello World (availability depends on the chosen flavor).

---

## nsf build

Builds the project for the selected platform and produces an application package (APK, AAB, etc.).

> [!NOTE]
> Currently, `nsf build` only supports **Android**. iOS and VisionOS options are disabled.

### Usage

```bash
nsf build
```

### Build Presets

When you run `nsf build`, you will be prompted to choose a build preset:

#### 1. PRODUCTION

Release build with full optimization and keystore signing.

- **Command**: `ns clean && ns build android --env.uglify --release --key-store-path ... --key-store-password ... --key-store-alias ... --key-store-alias-password ... [--aab|--apk] [--copy-to ...]`
- **Required Inputs**:
  1. **Keystore Path**: Full path to your `.keystore` or `.jks` file.
  2. **Store Password**: The password for the keystore.
  3. **Store Alias**: The alias for the key.
  4. **Alias Password**: The password for the key alias.
- **Selection**:
  - **Optional Environment Flags**: Select additional flags like `commonjs`, `aot`, `snapshot`.
  - **Output Type**: Choose between AAB (Android App Bundle) or APK.
  - **Output Destination**: (Optional) Specify where to copy the final build file.

#### 2. DEVELOPMENT

Debug build for testing purposes.

- **Command**: `ns clean && ns build android [--aab|--apk] [--copy-to ...]`
- **Selection**:
  - **Optional Environment Flags**: Select additional flags like `uglify`, `commonjs`, `aot`.
  - **Output Type**: Choose between AAB or APK.
  - **Output Destination**: (Optional) Specify where to copy the final build file.

#### 3. CUSTOM

Manually select build options as before.

- Allows you to toggle individual flags like `--release`, `--justlaunch`, `--device`, `--hmr`, `--aab`, `--force`, `--env.aot`, `--env.uglify`, `--env.snapshot`, `--env.commonjs`, and `--env.*`.

---

## nsf resources

Generate application resources such as icons and splash screens interactively.

### Usage

```bash
nsf resources
```

### Process

1. **Choose Resource**: Select whether to generate an **Icon** or a **Splashscreen**.
2. **Input Image Path**: Provide the real/absolute path of the image you want to use. The recommended size is 1080x1080 pixels.
3. **Input Background Color** (Optional, Splashscreen only): Provide a background color code (e.g., `#000000`) for the splashscreen.

### Equivalent NativeScript CLI Commands

- For icons: `ns resources generate icons <source_image_path>`
- For splash screens: `ns resources generate splashes <source_image_path> --background <color_code>`

---

## nsf plugin

Manage NativeScript plugins for your project interactively.

### Usage

```bash
nsf plugin
```

### Process

1. **Select Category**: Choose between **Project Management** or **Plugin Development**.
2. **Select Action**: Choose the specific action based on the category.
3. **Input Plugin Name**: Required for Add, Remove, Update, and Create actions.

### Actions

#### Project Management

- **List plugins**: Displays all installed plugins (`ns plugin`).
- **Add plugin**: Installs a new plugin and its dependencies (`ns plugin add <name>`).
- **Remove plugin**: Uninstalls a plugin and its dependencies (`ns plugin remove <name>`).
- **Update plugin**: Reinstalls a plugin to update it (`ns plugin update <name>`).

#### Plugin Development

- **Build plugin**: Builds the Android parts of a plugin (`ns plugin build`).
- **Create plugin**: Creates a new plugin project (`ns plugin create <name>`).

---

## nsf proxy

Manage proxy settings for the NativeScript CLI.

### Usage

```bash
nsf proxy
```

### Options

1. **Show**: Displays the current proxy configuration.
2. **Set**: Configures a new proxy.
   - **Proxy URL** (Required): The full URL of the proxy (e.g., `http://127.0.0.1:8888`).
   - **Credentials** (Optional, Windows only): If required, you can provide a **Username** and **Password**.
3. **Clear**: Removes the current proxy configuration.

> [!IMPORTANT]
> **SSL Connections**
> The `set` operation automatically includes the `--insecure` flag, allowing SSL connections even without a valid CA certificate.

> [!NOTE]
> **External Proxies**
> NativeScript CLI proxy settings do not automatically apply to other tools. You must configure them separately:
>
> - **NPM**: [https://docs.npmjs.com/misc/config#https-proxy](https://docs.npmjs.com/misc/config#https-proxy)
> - **Gradle**: [https://docs.gradle.org/3.3/userguide/build_environment.html#sec:accessing_the_web_via_a_proxy](https://docs.gradle.org/3.3/userguide/build_environment.html#sec:accessing_the_web_via_a_proxy)
> - **Docker**: [https://docs.docker.com/network/proxy/](https://docs.docker.com/network/proxy/)

---

## nsf native

Create and manage platform language classes or utilities for your NativeScript project.

> [!TIP]
> **NativeScript 8.8+ Reference**
> This command is based on the `ns native` feature introduced in NativeScript 8.8. For more details, see the [official announcement](https://blog.nativescript.org/nativescript-8-8-announcement/#ns-native).

### Usage

```bash
nsf native
```

### Process

1. **Select Action**: Choose between **Add Native Code** or **Native Usage**.
2. **Add Native Code**:
   - **Select Language**: Swift, Objective-C, Kotlin, or Java.
   - **Input Class Name**: Enter the name of the class (use package name for Android, e.g., `com.company.MyClass`).
3. **Native Usage**:
   - Scans the project for existing native code.
   - Select a file to see how to call it from NativeScript.

---

## nsf doctor

Check your environment for potential issues.

### Usage

```bash
nsf doctor
```

---

## nsf info

Display information about the current environment.

### Usage

```bash
nsf info
```

---

## nsf pm

Manage the default package manager for NativeScript.

### Usage

```bash
nsf pm get
```

or

```bash
nsf pm set
```

### Subcommands

#### 1. nsf pm get

Displays the package manager that is currently set as the default in your NativeScript environment.

- **Equivalent CLI Command**: `ns package-manager get`

#### 2. nsf pm set

Interactively scans your system for available package managers and allows you to select one to set as the default.

- **Process**:
    1. Scans for `npm`, `yarn`, `pnpm`, and `bun`.
    2. Displays a list of those found on your system.
    3. Prompts you to select your preferred package manager.
- **Equivalent CLI Command**: `ns package-manager set <PM_NAME>`

> [!TIP]
> **pnpm Optimization**
> If you select **pnpm**, `nsf` will automatically create/update a `.npmrc` file in your project root with `node-linker=hoisted`. This ensures that `pnpm` uses a flat `node_modules` structure, which is required for NativeScript to function correctly.

---

## nsf bundler

Switch between **Webpack (Classic)** and **Vite (Modern)** bundlers interactively, with automatic configuration and backup management.

### Usage

```bash
nsf bundler
```

or using the alias:

```bash
nsf app-bundle
```

### Features

#### 1. Instant Switch
Detects your current bundler and offers to switch to the alternative (e.g., if you are using Webpack, it suggests Vite).

#### 2. Automatic Configuration
- **Vite**: Automatically generates a `vite.config.ts` tailored to your project's flavor (Angular, Vue, React, Svelte, or TypeScript).
- **Webpack**: Generates a default `webpack.config.js` if missing.
- **Config Sync**: Automatically cleans up `nativescript.config.ts` (e.g., removing `webpackConfigPath` when moving to Vite) to ensure compatibility.

#### 3. Smart Backup System
Before any changes are made, `nsf` creates a snapshot of your current configuration in the `.nsforge/backups/bundler/` directory.
- **Copied**: `package.json` and `nativescript.config.ts` are copied to the backup folder.
- **Moved (Cut)**: The current bundler's config file (`webpack.config.js` or `vite.config.ts`) is moved to the backup folder to prevent conflicts in the root.

#### 4. Restore from Backup
If backups exist in `.nsforge`, a **Restore Config from Backup** option will appear in the menu. This allows you to:
- See a list of all available Webpack and Vite backups.
- Select a specific timestamp to restore.
- Automatically switch bundlers if the selected backup type differs from your current one.

#### 5. Post-Switch Cleanup
After a successful switch or restore, `nsf` will prompt you to run `ns clean`. This is **highly recommended** to remove old build artifacts and prevent startup crashes on the device.

### References

- [NativeScript Configuration](https://docs.nativescript.org/configuration/nativescript)
- [Vite Configuration in NativeScript](https://docs.nativescript.org/configuration/vite)
- [Webpack Configuration in NativeScript](https://docs.nativescript.org/configuration/webpack)

---

## Development Commands (Run & Debug)

> [!WARNING]
> **Important: Termination Issues & Recommendation**
> The `nsf run` and `nsf debug` commands are currently difficult to terminate cleanly via the CLI once they are running.
>
> **Main Recommendation:**
> It is highly recommended to use the native NativeScript CLI commands directly for a more stable experience when running and debugging your applications:
>
> - For Run: `ns run <platform>` (e.g., `ns run android`)
> - For Debug: `ns debug <platform>` (e.g., `ns debug android`)
>
> The commands below can still be used if you prefer the interactive `nsf` interface, but please be aware of these termination limitations.

### nsf run

Runs your project on all connected devices or simulators for the selected platform. This command prepares, builds, and deploys the app.

#### Usage

```bash
nsf run
```

#### Interactive Platform Selection

- **Android**: Run on Android devices or emulators.
- **iOS**: Run on iOS devices or simulators.
- **VisionOS**: Run on VisionOS simulators.

> [!TIP]
> **Navigation Tips:**
>
> - Use **Arrow Keys** to navigate.
> - Press **Space** to select/unselect options in multiselect.
> - Press **Enter** to confirm your selection.

#### Interactive Options

For a detailed list of interactive options and their corresponding CLI flags, please refer to the [RUN.md](./command-mapping/RUN.md) command mapping documentation.

---

### nsf debug

Builds, deploys, and starts a debugging session for your NativeScript project using Chrome DevTools.

#### Usage

```bash
nsf debug
```

#### Interactive Platform Selection

- **Android**: Debug on Android devices or emulators.
- **iOS**: Debug on iOS devices or simulators.

#### Interactive Options

For a detailed list of interactive options and their corresponding CLI flags, please refer to the [DEBUG.md](./command-mapping/DEBUG.md) command mapping documentation.
