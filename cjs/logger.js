"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.verbose = void 0;
let _verbose = false;
function verbose(enable) {
    if (typeof enable === "boolean") {
        _verbose = enable;
    }
    return _verbose;
}
exports.verbose = verbose;
function info(...args) {
    if (_verbose)
        console.log("[asset-pipeline]", ...args);
}
exports.info = info;
