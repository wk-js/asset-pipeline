"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
/**
 * Clean path
 */
function cleanPath(input) {
    const i = input.split('/');
    i.push('');
    input = path_1.default.normalize(i.join('/')).slice(0, -1);
    return input;
}
exports.cleanPath = cleanPath;
/**
 *
 */
function toUnixPath(pth) {
    pth = pth.replace(/\\/g, '/');
    const double = /\/\//;
    while (pth.match(double)) {
        pth = pth.replace(double, '/'); // node on windows doesn't replace doubles
    }
    return pth;
}
exports.toUnixPath = toUnixPath;
/**
 * Remove extras
 */
function removeSearch(pth) {
    return pth.split(/\?|\#/)[0];
}
exports.removeSearch = removeSearch;
