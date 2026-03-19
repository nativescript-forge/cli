import pc from "picocolors";

export const FORGE_COLOR = (text: string) =>
  `\x1b[38;2;249;168;37m${text}\x1b[0m`;
export const BG_FORGE_COLOR = (text: string) =>
  `\x1b[48;2;249;168;37m\x1b[30m${text}\x1b[0m`;

export const UI_STRINGS = {
  outro: FORGE_COLOR(" NativeScript Forge CLI! "),
  cancel: "Operation cancelled.",
  error: (msg: string) => pc.red(`Error: ${msg}`),
};
