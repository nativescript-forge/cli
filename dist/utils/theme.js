"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const picocolors_1 = __importDefault(require("picocolors"));
const FORGE_COLOR_FN = (text) => `\x1b[38;2;249;168;37m${String(text)}\x1b[0m`;
// Override clack/prompts defaults to use NativeScript Forge orange accent
picocolors_1.default.cyan = FORGE_COLOR_FN; // For active interactive elements, like selection symbols
picocolors_1.default.gray = FORGE_COLOR_FN; // For accent lines and decorators
picocolors_1.default.green = FORGE_COLOR_FN; // For success symbols
