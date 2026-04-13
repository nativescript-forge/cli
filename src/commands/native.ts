import {
  intro,
  outro,
  select,
  text,
  isCancel,
  cancel,
  note,
  spinner,
} from "@clack/prompts";
import { execSync } from "child_process";
import pc from "picocolors";
import path from "path";
import fs from "fs";
import { BG_FORGE_COLOR, UI_STRINGS } from "../utils/ui";

export async function nativeCommand() {
  intro(BG_FORGE_COLOR(" nsf native "));

  const action = await select({
    message: "What would you like to do?",
    options: [
      {
        value: "add",
        label: "Add Native Code",
        hint: "Generate a new native class",
      },
      {
        value: "usage",
        label: "Native Usage",
        hint: "See how to call existing native code",
      },
    ],
  });

  if (isCancel(action)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  if (action === "add") {
    await addNativeCode();
  } else {
    await nativeUsage();
  }
}

function getProjectId(): string | null {
  try {
    const configPath = path.join(process.cwd(), "nativescript.config.ts");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      const match = content.match(/id:\s*["']([^"']+)["']/);
      return match ? match[1] : null;
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

async function addNativeCode() {
  const projectId = getProjectId();
  const language = (await select({
    message: "Select language:",
    options: [
      { value: "swift", label: "Swift", hint: "iOS" },
      { value: "objective-c", label: "Objective-C", hint: "iOS" },
      { value: "kotlin", label: "Kotlin", hint: "Android" },
      { value: "java", label: "Java", hint: "Android" },
    ],
  })) as string;

  if (isCancel(language)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const className = (await text({
    message: `Enter ${language} class name:`,
    placeholder:
      language === "kotlin" || language === "java"
        ? "com.company.MyClass"
        : "MyClass",
    initialValue:
      (language === "kotlin" || language === "java") && projectId
        ? `${projectId}.MyClass`
        : "",
    validate(value) {
      if (!value) return "Class name is required";
    },
  })) as string;

  if (isCancel(className)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const s = spinner();
  s.start(`Generating ${language} class ${className}...`);

  try {
    execSync(`ns native add ${language} ${className}`, { encoding: "utf8" });
    s.stop(`Successfully generated ${language} class.`);

    // Inform user about location
    let location = "";
    if (language === "swift") {
      location = `App_Resources/iOS/src/${className}.swift`;
    } else if (language === "objective-c") {
      location = `App_Resources/iOS/src/${className}.h`;
    } else {
      const parts = className.split(".");
      const pkgPath = parts.join("/");
      const ext = language === "kotlin" ? "kt" : "java";
      location = `App_Resources/Android/src/main/java/${pkgPath}.${ext}`;
    }

    note(
      `${pc.white("Summary:")}\n` +
        `${pc.dim("  Language: ")} ${pc.cyan(language)}\n` +
        `${pc.dim("  Class:    ")} ${pc.cyan(className)}\n` +
        `${pc.dim("  File:     ")} ${pc.cyan(location)}\n\n` +
        `${pc.white("Next steps:")}\n` +
        `  You can now start writing NativeScript code to interact with this native class!`,
      "Success",
    );
    outro(UI_STRINGS.outro);
  } catch (error: any) {
    s.stop("Failed to generate native class.");
    cancel(error.message || "An error occurred");
  }
}

async function nativeUsage() {
  const s = spinner();
  s.start("Scanning for native files...");

  const files: {
    label: string;
    value: string;
    platform: string;
    language: string;
    fullClassName?: string;
  }[] = [];
  const projectRoot = process.cwd();

  // iOS
  const iosSrc = path.join(projectRoot, "App_Resources", "iOS", "src");
  if (fs.existsSync(iosSrc)) {
    const iosFiles = fs.readdirSync(iosSrc);
    for (const file of iosFiles) {
      if (file.endsWith(".swift")) {
        files.push({
          label: pc.cyan(`[iOS] ${file}`),
          value: path.join(iosSrc, file),
          platform: "ios",
          language: "swift",
        });
      } else if (file.endsWith(".h")) {
        files.push({
          label: pc.cyan(`[iOS] ${file}`),
          value: path.join(iosSrc, file),
          platform: "ios",
          language: "objective-c",
        });
      }
    }
  }

  // Android
  const androidBasePaths = [
    path.join(projectRoot, "App_Resources", "Android", "src", "main", "java"),
    path.join(projectRoot, "App_Resources", "Android", "src", "main", "kotlin"),
  ];

  for (const androidSrc of androidBasePaths) {
    if (fs.existsSync(androidSrc)) {
      const scanDir = (dir: string) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
          } else if (item.endsWith(".kt") || item.endsWith(".java")) {
            const relativePath = path.relative(androidSrc, fullPath);
            const pkgName = relativePath
              .replace(/\.(kt|java)$/, "")
              .replace(/[\\/]/g, ".");
            files.push({
              label: pc.green(`[Android] ${pkgName}`),
              value: fullPath,
              platform: "android",
              language: item.endsWith(".kt") ? "kotlin" : "java",
              fullClassName: pkgName,
            });
          }
        }
      };
      scanDir(androidSrc);
    }
  }

  s.stop(`Found ${files.length} native files.`);

  if (files.length === 0) {
    cancel("No native files found in App_Resources.");
    return;
  }

  const selectedFile = (await select({
    message: "Select a native class to see usage:",
    options: files.map((f) => ({ value: f.value, label: f.label })),
  })) as string;

  if (isCancel(selectedFile)) {
    cancel(UI_STRINGS.cancel);
    process.exit(0);
  }

  const fileInfo = files.find((f) => f.value === selectedFile)!;
  const fileName = path.basename(fileInfo.value);
  const className = fileName.replace(/\.(swift|h|kt|java)$/, "");

  let usageCode = "";
  if (fileInfo.platform === "ios") {
    usageCode =
      `${pc.white("Example usage in NativeScript (TS/JS):")}\n\n` +
      `${pc.bold(`const instance = new ${className}();`)}\n\n` +
      `${pc.dim("// Call methods or access properties")}\n` +
      `${pc.dim(`// instance.someMethod();`)}`;
  } else {
    // Android: use full package name
    const fullClassName = fileInfo.fullClassName;
    usageCode =
      `${pc.white("Example usage in NativeScript (TS/JS):")}\n\n` +
      `${pc.bold(`const instance = new ${fullClassName}();`)}\n\n` +
      `${pc.dim("// Call methods or access properties")}\n` +
      `${pc.dim(`// instance.someMethod();`)}`;
  }

  note(usageCode, `Usage for ${className}`);
  outro(UI_STRINGS.outro);
}
