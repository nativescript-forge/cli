export interface Template {
  name: string;
  value: string;
}

export interface Flavor {
  name: string;
  templates: Template[];
}

export interface Platform {
  name: string;
  flavors: Flavor[];
}

export const TEMPLATE_MAPPING: Record<string, Platform> = {
  mobile: {
    name: "Mobile (Android/iOS)",
    flavors: [
      {
        name: "JavaScript",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank" },
          {
            name: "Drawer Navigation",
            value: "@nativescript/template-drawer-navigation",
          },
          { name: "Hello World", value: "@nativescript/template-hello-world" },
          {
            name: "Master Detail",
            value: "@nativescript/template-master-detail",
          },
          {
            name: "Tab Navigation",
            value: "@nativescript/template-tab-navigation",
          },
        ],
      },
      {
        name: "TypeScript",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-ts" },
          {
            name: "Drawer Navigation",
            value: "@nativescript/template-drawer-navigation-ts",
          },
          {
            name: "Hello World",
            value: "@nativescript/template-hello-world-ts",
          },
          {
            name: "Master Detail",
            value: "@nativescript/template-master-detail-ts",
          },
          {
            name: "Tab Navigation",
            value: "@nativescript/template-tab-navigation-ts",
          },
        ],
      },
      {
        name: "Angular",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-ng" },
          {
            name: "Drawer Navigation",
            value: "@nativescript/template-drawer-navigation-ng",
          },
          {
            name: "Hello World",
            value: "@nativescript/template-hello-world-ng",
          },
          {
            name: "Master Detail",
            value: "@nativescript/template-master-detail-ng",
          },
          {
            name: "Tab Navigation",
            value: "@nativescript/template-tab-navigation-ng",
          },
        ],
      },
      {
        name: "React",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-react" },
        ],
      },
      {
        name: "Solid",
        templates: [
          { name: "Blank (JS)", value: "@nativescript/template-blank-solid" },
          {
            name: "Blank (TS)",
            value: "@nativescript/template-blank-solid-ts",
          },
        ],
      },
      {
        name: "Svelte",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-svelte" },
        ],
      },
      {
        name: "Vue",
        templates: [
          { name: "Blank (JS)", value: "@nativescript/template-blank-vue" },
          { name: "Blank (TS)", value: "@nativescript/template-blank-vue-ts" },
          {
            name: "Drawer Navigation",
            value: "@nativescript/template-drawer-navigation-vue",
          },
          {
            name: "Master Detail",
            value: "@nativescript/template-master-detail-vue",
          },
          {
            name: "Tab Navigation",
            value: "@nativescript/template-tab-navigation-vue",
          },
        ],
      },
    ],
  },
  visionos: {
    name: "VisionOS (macOS)",
    flavors: [
      {
        name: "TypeScript",
        templates: [
          {
            name: "Hello World",
            value: "@nativescript/template-hello-world-ts-vision",
          },
        ],
      },
      {
        name: "Angular",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-ng-vision" },
          {
            name: "Hello World",
            value: "@nativescript/template-hello-world-ng-vision",
          },
        ],
      },
      {
        name: "React",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-react-vision" },
        ],
      },
      {
        name: "Solid",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-solid-vision" },
        ],
      },
      {
        name: "Svelte",
        templates: [
          {
            name: "Blank",
            value: "@nativescript/template-blank-svelte-vision",
          },
        ],
      },
      {
        name: "Vue",
        templates: [
          { name: "Blank", value: "@nativescript/template-blank-vue-vision" },
        ],
      },
    ],
  },
};
