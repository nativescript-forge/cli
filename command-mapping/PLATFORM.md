# PLATFORM Command Mapping

## Interactive Entry Points

Run `nsf platform` or select **Platform** in `nsf menu`.

1. Select **List**, **Add**, **Remove**, **Update**, or **Clean**.
2. Except for List, choose **Android**, **iOS**, or **VisionOS**.
3. For Add/Update, choose **Latest Stable**, **Next Release**, or **Specific Version**.

## Mappings

| Selection / direct command | NativeScript command |
| :--- | :--- |
| List / `nsf platform list` | `ns platform list` |
| Add / `nsf platform add <platform>` | `ns platform add <platform>` |
| Remove / `nsf platform remove <platform>` | `ns platform remove <platform>` |
| Update / `nsf platform update <platform>` | `ns platform update <platform>` |
| Clean / `nsf platform clean <platform>` | `ns platform clean <platform>` |
| Add/Update + Latest Stable | No version suffix |
| Add/Update + Next Release | `<platform>@next` |
| Add/Update + Specific Version | `<platform>@<version>` |

Direct Add/Remove/Update/Clean subcommands accept an optional platform. When omitted, platform selection opens. When supplied, the command executes directly; Add/Update accept an optional version suffix.

## Navigation and Execution

- Go Back: runtime to platform selection; platform to operations; operations to the main menu.
- Ctrl+C cancels without spawning a command during selection; shared cleanup terminates the child during execution.
- Shows command preview, progress spinner, and captured stdout/stderr, following existing proxy/plugin/pm patterns.
- Preserves command failure exit codes and handles process startup errors.
- Validates target names and version syntax before passing arguments to the shell.
- NativeScript validates project state, OS, and runtime support. Apple development requires macOS; VisionOS requires compatible CLI/runtime support.
- Remove deletes the platform directory and uninstalls the runtime. Clean reinstalls the selected platform and, in CLI 9.1.1, reuses its detected version. This is separate from project-wide `ns clean`.
- Advanced flags such as `--framework-path` are not exposed by this wrapper; use `ns` directly.

## Implementation and Research

- Source: `src/commands/platform.ts`; registration: `src/index.ts`, `src/commands/menu.ts`.
- Verified against installed NativeScript CLI 9.1.1: `lib/bootstrap.js`, platform command implementations, `lib/helpers/platform-command-helper.js`, and `lib/common/mobile/mobile-helper.js`.
- The installed source includes VisionOS and preserves the detected version on platform clean, unlike some legacy documentation.
- [Official CLI repository](https://github.com/NativeScript/nativescript-cli)
- [Official platform add reference (legacy)](https://old.docs.nativescript.org/tooling/docs-cli/project/configuration/platform-add)
- [Official platform update reference (legacy)](https://old.docs.nativescript.org/tooling/docs-cli/project/configuration/platform-update)
