# SKILL Command Mapping

## Interactive Menu

`nsf skill`, alias `nsf skills`, or **Skills** in `nsf menu` opens:

```text
Skills
  List
    Official Skills -> details -> confirm -> installer
    nStudio Skills  -> details -> confirm -> installer
  Guide
    Official Skills -> usage and Official examples
    nStudio Skills  -> usage and nStudio examples
```

List browses installable collections, not installed skills. Before confirmation it shows the collection description, capabilities, GitHub URL, README URL, and the installation steps that follow. No returns to List without invoking npx. Guide displays source-specific steps and concrete agent prompts, then returns to guide selection without running an installer. Back from a collection submenu returns to List/Guide; Back from operations returns to the main menu when launched there. Ctrl+C cancels safely.

## Direct Commands and Mappings

| Entry / selection | Behavior |
| :--- | :--- |
| `nsf skill list` | Open List collection selection |
| `nsf skill install` | Open List collection selection |
| List > Official Skills > Yes / `nsf skill install official` > Yes | `npx --yes skills@latest add NativeScript/skills` |
| List > nStudio Skills > Yes / `nsf skill install nstudio` > Yes | `npx --yes skills@latest add nstudio/nativescript-agent-skills` |
| `nsf skill guide` | Open Guide collection selection |
| `nsf skill guide official` / `nstudio` | Show that collection's guide and exit |
| Guide > collection | Show that collection's guide and return to guide selection |

Source arguments accept only curated IDs, trimmed and case-insensitive. Other repository URLs/shorthand, local paths, arbitrary flags, and shell fragments are rejected before prompting or spawning.

## Installation and Process Behavior

Both repositories contain collections. The shared skills CLI discovers individual skills and supported agents and handles skill selection, agents, project/global scope, installation method as applicable, and final confirmation. Forge does not maintain a full static inventory or its own filesystem installer.

Both READMEs also offer provider-specific distribution methods. Forge uses their shared cross-agent skills add route; it does not create their npm-specific manifests.

- npx `--yes` only permits obtaining the latest runner. No `--yes` or `--all` is passed to skills add.
- Inherit stdin/stdout/stderr so installer prompts remain interactive.
- Windows runs `npx.cmd` through the shell; other systems run `npx` without a shell. Repository arguments come only from the curated code registry.
- Current working directory is preserved. Agent destinations, global installs, and overwrite notices are managed upstream.
- Shared SIGINT cleanup terminates the child. Startup errors, nonzero exits, and signal termination are handled without reporting success.
- Requires npm/npx, Git, network access, and Node.js supported by the latest skills CLI (currently 22.20+). NativeScript CLI is not required.

## Metadata and Extension

`src/utils/skill-sources.ts` defines entries with a unique lowercase `id`, `label`, GitHub `repository`, `description`, `capabilities`, and `examples`. List, confirmation, and Guide share this metadata. Add curated collections here without changing the handler; reserve `__` IDs for navigation. There is no custom repository option.

Official details cover core/runtime, UI, native integration, testing, and tooling. Its example prompts use ns-http-gotchas and ns-unit-testing. nStudio details cover native APIs, rendering, interop, UI patterns, and tooling recipes; its examples use ns-ios-scenekit-from-typescript and ns-android-java-interop-gotchas. These are illustrative examples requiring the named skills to be installed, not a full inventory. Each guide links to its own README for current availability.

## Implementation

- `src/commands/skill.ts`: List/Guide navigation, details, confirmation, and installer execution.
- `src/utils/skill-sources.ts`: shared metadata and curated ID lookup.
- `src/index.ts`, `src/commands/menu.ts`: CLI and main menu registration.
- `tests/skill.test.cjs`: submenu navigation, per-source details/examples, consent/refusal, curated ID restrictions, and process lifecycle coverage.

## Research Sources

Reviewed on 2026-10-29:

- [NativeScript skills README](https://github.com/NativeScript/skills/blob/main/README.md)
- [nstudio skills README](https://github.com/nstudio/nativescript-agent-skills/blob/main/README.md)
- [skills CLI README](https://github.com/vercel-labs/skills/blob/main/README.md)
- [skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)
- [skills add implementation](https://github.com/vercel-labs/skills/blob/main/src/add.ts)
