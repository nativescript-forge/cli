"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI_STRINGS = exports.BG_FORGE_COLOR = exports.FORGE_COLOR = void 0;
const picocolors_1 = __importDefault(require("picocolors"));
const FORGE_COLOR = (text) => `\x1b[38;2;249;168;37m${text}\x1b[0m`;
exports.FORGE_COLOR = FORGE_COLOR;
const BG_FORGE_COLOR = (text) => `\x1b[48;2;249;168;37m\x1b[30m${text}\x1b[0m`;
exports.BG_FORGE_COLOR = BG_FORGE_COLOR;
exports.UI_STRINGS = {
    outro: (0, exports.FORGE_COLOR)(" NativeScript Forge CLI! "),
    cancel: "Operation cancelled.",
    error: (msg) => picocolors_1.default.red(`Error: ${msg}`),
};
