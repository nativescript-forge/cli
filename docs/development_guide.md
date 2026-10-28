# Development & Contribution Guide

This guide describes how to set up, build, test, and contribute to the **NativeScript Forge CLI (`nsf`)** project.

---

## 1. Development Prerequisites

Ensure you have the following installed on your developer machine:
- **Node.js**: Version 18.0.0 or higher.
- **npm** or another preferred package manager (pnpm, yarn).
- **NativeScript CLI**: Installed globally (`npm install -g nativescript`).

---

## 2. Local Setup & Installation

Follow these steps to set up the codebase locally:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/nativescript-forge/cli.git
    cd cli
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run in Development Mode**:
    You can run the TypeScript code directly using `ts-node` without compiling first:
    ```bash
    npm run dev
    ```
    For example, to test the `create` command:
    ```bash
    npm run dev -- create my-app
    ```

---

## 3. Build & Compilation

The project uses `tsup` for extremely fast bundling and compilation.

- **To compile the project**:
  ```bash
  npm run build
  ```
  This command will compile all TypeScript files in `src/` and output them to the `dist/` directory as `dist/index.js`.

- **To run the compiled script**:
  ```bash
  npm start
  ```

---

## 4. Linting & Formatting

To maintain a clean and consistent code style, we use `eslint` and `prettier`.

*   **Check code quality (Lint)**:
    ```bash
    npm run lint
    ```
*   **Format code automatically**:
    ```bash
    npm run format
    ```

---

## Automated Command Tests

Run `npm test` to verify platform operation and target selection, runtime versions, back navigation, cancellation, argument validation, and child-process failure handling. The tests use mocked prompts and processes, so they do not modify a NativeScript project or require a working mobile SDK.

## 5. Local CLI Testing (Linking)

To test the `nsf` command globally on your machine:

1.  **Link the package**:
    In the root of the repository, run:
    ```bash
    npm link
    ```
2.  **Test the command**:
    You can now run the `nsf` command anywhere in your terminal.
3.  **Unlink the package** (when done):
    ```bash
    npm unlink -g @nativescript-forge/cli
    ```

---

## 6. Release & Publishing

Before publishing, ensure the linting checks pass and the code compiles successfully:

```bash
npm run prepublishOnly
```

To publish a new version to the npm registry:
1.  Update the version field in `package.json`.
2.  Commit changes and tag the release in Git.
3.  Publish to npm:
    ```bash
    npm publish --access public
    ```
