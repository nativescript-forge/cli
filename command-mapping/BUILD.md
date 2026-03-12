# BUILD Command Mapping

Mapping of `nsf build` interactive options to standard NativeScript CLI (`ns`) flags.

## Platforms
- **Android**: `ns build android`
- ~~**iOS**: `ns build ios`~~
- ~~**VisionOS**: `ns build visionos`~~

## Options Mapping

| Interactive Label | CLI Flag | Description |
| :--- | :--- | :--- |
| **Release build** | `--release` | Produces a production-ready build with optimizations. |
| **Just launch** | `--justlaunch` | Does not print application output in the console. |
| **Select device** | `--device <ID>` | Specifies a connected target device/identifier. |
| **Enable HMR** | `--hmr` | Enables Hot Module Replacement. |
| **Android App Bundle** | `--aab` | Builds/Deploys .aab for Android. |
| **Force check** | `--force` | Skips compatibility checks and forces dependency installation. |
| **Environment flags** | `--env.*` | Passes custom environment variables (aot, snapshot, uglify, etc.). |

---

## Environment Flags Detail
- `--env.aot`: Creates Ahead-Of-Time build (Angular).
- `--env.snapshot`: Creates a V8 Snapshot (Android Release).
- `--env.compileSnapshot`: Compiles static assets from snapshot into `.so`.
- `--env.uglify`: Basic obfuscation and smaller size.
- `--env.report`: Creates Webpack report.
- `--env.sourceMap`: Inline source maps.
- `--env.hiddenSourceMap`: Source maps in root (Crashlytics).
