# Commands Documentation

Detailed documentation for all NativeScript Forge CLI (`nsf`) commands.

> [!NOTE]
> **NativeScript CLI Fallback**
> You can run basic commands available in `ns` using `nsf`. If a command is not natively implemented in `nsf`, it will automatically delegate to the NativeScript CLI (`ns`). If the command is not supported by either `nsf` or `ns`, an error will occur.

## Table of Contents

- [nsf create](#nsf-create)
- [nsf run](#nsf-run)
- [nsf build](#nsf-build)
- [nsf resources](#nsf-resources)

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
  - **Output Type**: Choose between AAB (Android App Bundle) or APK.
  - **Output Destination**: (Optional) Specify where to copy the final build file.

#### 2. DEVELOPMENT

Debug build for testing purposes with uglify optimization.

- **Command**: `ns clean && ns build android --env.uglify [--aab|--apk] [--copy-to ...]`
- **Selection**:
  - **Output Type**: Choose between AAB or APK.
  - **Output Destination**: (Optional) Specify where to copy the final build file.

#### 3. CUSTOM

Manually select build options as before.

- Allows you to toggle individual flags like `--release`, `--justlaunch`, `--device`, `--hmr`, `--aab`, `--force`, and `--env.*`.

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
