"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidURL = exports.cleanup = exports.getNormalizedPaths = exports.normalize = void 0;
const Path = __importStar(require("path"));
const WIN32_SEP_REG = /\\/g;
const DOUBLE_BACKSLASH_REG = /\/\//;
const CLEAN_URL_START_REG = /^\.\//;
const CLEAN_URL_END_REG = /\/$/;
const SEARCH_HASH_REG = /\?|\#/;
/**
 * Normalize path to current os format (system), unix format (unix) or web format (web)
 */
function normalize(path, type = "web") {
    switch (type) {
        case "os": return Path.normalize(path);
        case "unix":
            {
                path = normalize(path, "os");
                path = path.replace(WIN32_SEP_REG, Path.posix.sep);
                while (path.match(DOUBLE_BACKSLASH_REG)) {
                    path = path.replace(DOUBLE_BACKSLASH_REG, Path.posix.sep); // node on windows doesn't replace doubles
                }
                return path;
            }
        case "web":
            {
                path = normalize(path, "unix");
                path = path.replace(CLEAN_URL_START_REG, "");
                if (!(path.length === 1 && CLEAN_URL_END_REG.test(path))) {
                    path = path.replace(CLEAN_URL_END_REG, "");
                }
                return path;
            }
    }
}
exports.normalize = normalize;
/**
 * Get all different normalized paths
 */
function getNormalizedPaths(path) {
    return {
        os: normalize(path, "os"),
        unix: normalize(path, "unix"),
        web: normalize(path, "web"),
    };
}
exports.getNormalizedPaths = getNormalizedPaths;
/**
 * Remove hash and search parameters
 */
function cleanup(path) {
    return path.split(SEARCH_HASH_REG)[0];
}
exports.cleanup = cleanup;
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isValidURL = isValidURL;
