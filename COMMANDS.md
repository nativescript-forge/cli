# Commands Documentation

Detailed documentation for all NativeScript Forge CLI (`nsf`) commands.

> [!NOTE]
> **NativeScript CLI Fallback**
> You can run basic commands available in `ns` using `nsf`. If a command is not natively implemented in `nsf`, it will automatically delegate to the NativeScript CLI (`ns`). If the command is not supported by either `nsf` or `ns`, an error will occur.

## Table of Contents

- [nsf create](#nsf-create)
- [nsf run](#nsf-run)
- [nsf build](#nsf-build)

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

## nsf run

Runs your project on all connected devices or simulators for the selected platform. This command prepares, builds, and deploys the app.

### Usage

```bash
nsf run
```

### Interactive Platform Selection

- **Android**: Run on Android devices or emulators.
- **iOS**: Run on iOS devices or simulators.
- **VisionOS**: Run on VisionOS simulators.

> [!TIP]
> **Navigation Tips:**
>
> - Use **Arrow Keys** to navigate.
> - Press **Space** to select/unselect options in multiselect.
> - Press **Enter** to confirm your selection.

### Interactive Options (Detailed)

| Option                 | Description                                                                                                                                                                 | Flag            |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| **Release build**      | Produces a release build by running webpack in production mode and native build in release mode.                                                                            | `--release`     |
| **Just launch**        | Launches the application on the device without attaching the console output.                                                                                                | `--justlaunch`  |
| **Select device**      | Automatically detects available devices and lets you pick from a list. Includes options to **Check Again** or **Continue** to let NativeScript CLI handle it automatically. | `--device <ID>` |
| **Disable HMR**        | Disables Hot Module Replacement. Restarts the whole app on code change.                                                                                                     | `--no-hmr`      |
| **Android App Bundle** | Produces and deploys an Android App Bundle (.aab).                                                                                                                          | `--aab`         |
| **Force check**        | Skips compatibility checks and forces dependency installation.                                                                                                              | `--force`       |
| **Environment flags**  | Allows passing additional flags like `aot`, `snapshot`, `uglify`, `report`, etc.                                                                                            | `--env.*`       |

---

## nsf build

Builds the project for the selected platform and produces an application package (APK, AAB, etc.).

### Usage

```bash
nsf build
```

### Interactive Platform Selection

- **Android**: Build for Android.
- **iOS**: Build for iOS.
- **VisionOS**: Build for VisionOS.

### Interactive Options (Detailed)

| Option                 | Description                                                    | Flag            |
| :--------------------- | :------------------------------------------------------------- | :-------------- |
| **Release build**      | Produces a release build with production optimizations.        | `--release`     |
| **Just launch**        | Does not print application output in the console.              | `--justlaunch`  |
| **Select device**      | Targets a specific device/identifier for the build process.    | `--device <ID>` |
| **Enable HMR**         | Enables Hot Module Replacement (HMR).                          | `--hmr`         |
| **Android App Bundle** | Produces an Android App Bundle (.aab).                         | `--aab`         |
| **Force check**        | Skips compatibility checks and forces dependency install.      | `--force`       |
| **Environment flags**  | Specify flags like `aot`, `snapshot`, `uglify`, `report`, etc. | `--env.*`       |

---

<div align="center">
  <p><i>Generated by NativeScript Forge CLI Documentation System</i></p>
</div>
