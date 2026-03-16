# CREATE Command Mapping

This document maps the `nsf create` interactive command to its corresponding NativeScript CLI (`ns`) templates.

## Overview

The `nsf create` command provides a guided process to create a new NativeScript project, allowing you to select platforms, flavors, and templates interactively.

## Command Mappings

### 1. Mobile (Android/iOS)

| Flavor | Template Package |
| :--- | :--- |
| **JavaScript** | `@nativescript/template-blank`, `@nativescript/template-drawer-navigation`, `@nativescript/template-hello-world`, `@nativescript/template-master-detail`, `@nativescript/template-tab-navigation` |
| **TypeScript** | `@nativescript/template-blank-ts`, `@nativescript/template-drawer-navigation-ts`, `@nativescript/template-hello-world-ts`, `@nativescript/template-master-detail-ts`, `@nativescript/template-tab-navigation-ts` |
| **Angular** | `@nativescript/template-blank-ng`, `@nativescript/template-drawer-navigation-ng`, `@nativescript/template-hello-world-ng`, `@nativescript/template-master-detail-ng`, `@nativescript/template-tab-navigation-ng` |
| **React** | `@nativescript/template-blank-react` |
| **Solid** | `@nativescript/template-blank-solid` (JS), `@nativescript/template-blank-solid-ts` (TS) |
| **Svelte** | `@nativescript/template-blank-svelte` |
| **Vue** | `@nativescript/template-blank-vue` (JS), `@nativescript/template-blank-vue-ts` (TS), `@nativescript/template-drawer-navigation-vue`, `@nativescript/template-master-detail-vue`, `@nativescript/template-tab-navigation-vue` |

---

### 2. VisionOS (macOS)

| Flavor | Template Package |
| :--- | :--- |
| **TypeScript** | `@nativescript/template-hello-world-ts-vision` |
| **Angular** | `@nativescript/template-blank-ng-vision`, `@nativescript/template-hello-world-ng-vision` |
| **React** | `@nativescript/template-blank-react-vision` |
| **Solid** | `@nativescript/template-blank-solid-vision` |
| **Svelte** | `@nativescript/template-blank-svelte-vision` |
| **Vue** | `@nativescript/template-blank-vue-vision` |

---

## Implementation Details

- **File:** `src/commands/create.ts`
- **Behavior:** This command uses `@clack/prompts` to gather project details and executes `ns create <appName> --template <templatePackage>`.
- **Source:** Based on https://docs.nativescript.org/guide/creating-a-project.
