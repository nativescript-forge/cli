# NATIVE Command Mapping

This document maps the `nsf native` interactive command to its corresponding NativeScript CLI (`ns`) commands and flags.

## Overview

The `nsf native` command allows you to easily create and manage platform language classes or utilities for your NativeScript project.

## Command Mappings

### 1. Adding Native Code
- **Swift**: `ns native add swift <ClassName>`
- **Objective-C**: `ns native add objective-c <ClassName>`
- **Kotlin**: `ns native add kotlin <PackageName.ClassName>`
- **Java**: `ns native add java <PackageName.ClassName>`

---

### 2. Usage Analysis
- **nsf native usage**: Scans the project for native code files and provides examples of how to call them from NativeScript (JavaScript/TypeScript).

---

## Implementation Details

- **File:** `src/commands/native.ts`
- **Behavior:** This command wraps the NativeScript `ns native` command and adds an interactive way to generate usage examples.
- **Source:** Based on `ns native --help`.
