"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
/**
 * Clean path
 */
function clean_path(input) {
    const i = input.split('/');
    i.push('');
    input = path_1.default.normalize(i.join('/')).slice(0, -1);
    return input;
}
exports.clean_path = clean_path;
/**
 *
 */
function to_unix_path(pth) {
    pth = pth.replace(/\\/g, '/');
    const double = /\/\//;
    while (pth.match(double)) {
        pth = pth.replace(double, '/'); // node on windows doesn't replace doubles
    }
    return pth;
}
exports.to_unix_path = to_unix_path;
/**
 * Remove extras
 */
function remove_search(pth) {
    return pth.split(/\?|\#/)[0];
}
exports.remove_search = remove_search;
