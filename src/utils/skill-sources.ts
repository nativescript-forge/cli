export interface SkillSource {
  id: string;
  label: string;
  repository: string;
  description: string;
  capabilities: readonly string[];
  examples: readonly string[];
}

// Add curated collections here; List, details, and Guide use the same metadata.
export const SKILL_SOURCES: readonly SkillSource[] = [
  {
    id: "official",
    label: "Official Skills",
    repository: "NativeScript/skills",
    description:
      "Official NativeScript guidance for core APIs, native UI, and tooling",
    capabilities: [
      "Core APIs and runtime behavior: bindings, navigation, colors, HTTP, and web globals.",
      "Native UI: layouts, CSS, animations, keyboard handling, and reusable view patterns.",
      "Android/iOS integration, unit tests, debugging, and build tooling.",
    ],
    examples: [
      "Use the installed ns-http-gotchas skill to diagnose why my NativeScript HTTP request treats a 404 response as success. Here is the code: <code>.",
      "Use the installed ns-unit-testing skill to help set up tests for this NativeScript project. Here is my current configuration: <config>.",
    ],
  },
  {
    id: "nstudio",
    label: "nStudio Skills",
    repository: "nstudio/nativescript-agent-skills",
    description:
      "NativeScript recipes for native integrations, custom rendering, and UI",
    capabilities: [
      "Native APIs from TypeScript: SceneKit, CoreLocation, haptics, and native sheets.",
      "Custom rendering and platform interop: Android Canvas, custom views, and Java marshalling.",
      "UI and tooling recipes: glass panels, keyboard accessories, app assets, and Angular/Vite migration.",
    ],
    examples: [
      "Use the installed ns-ios-scenekit-from-typescript skill to build a 3D view in this NativeScript iOS project. My goal is: <scene description>.",
      "Use the installed ns-android-java-interop-gotchas skill to diagnose this Android Java interop error: <error and relevant code>.",
    ],
  },
];

export function findSkillSource(id: string): SkillSource | undefined {
  return SKILL_SOURCES.find((entry) => entry.id === id.trim().toLowerCase());
}
