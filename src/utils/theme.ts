import pc from "picocolors";

const FORGE_COLOR_FN = (text: any) =>
  `\x1b[38;2;249;168;37m${String(text)}\x1b[0m`;

// Override clack/prompts defaults to use NativeScript Forge orange accent
pc.cyan = FORGE_COLOR_FN; // For active interactive elements, like selection symbols
pc.gray = FORGE_COLOR_FN; // For accent lines and decorators
pc.green = FORGE_COLOR_FN; // For success symbols

export {};
