# RUN Command Mapping

Mapping of `nsf run` interactive options to standard NativeScript CLI (`ns`) flags.

## Platforms
- **Android**: `ns run android`
- **iOS**: `ns run ios`
- **VisionOS**: `ns run visionos`

## Options Mapping

| Interactive Label | CLI Flag | Description |
| :--- | :--- | :--- |
| **Release build** | `--release` | Produces a production-ready build. |
| **Just launch** | `--justlaunch` | Launches the app without terminal output. |
| **Select device** | `--device <ID>` | Targets a specific device or emulator. |
| **Disable HMR** | `--no-hmr` | Disables Hot Module Replacement. |
| **Android App Bundle** | `--aab` | Builds/Deploys .aab for Android. |
| **Force check** | `--force` | Skips compatibility checks. |
| **Environment flags** | `--env.<flag>` | Passes custom environment variables. |

---

## Device Selection Flow
1. **Fetch**: `ns device <platform> --available-devices`
2. **Select**: User picks from identified devices.
3. **Manual**: Fallback to manual ID input if needed.
