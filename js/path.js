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
exports.PathWrapper = exports.createWrapper = exports.cleanup = exports.getNormalizedPaths = exports.normalize = void 0;
const Path = __importStar(require("path"));
const BACKSLASH_REG = /\\/g;
const DOUBLE_BACKSLASH_REG = /\/\//;
const CLEAN_URL_REG = /^\.\/|\/$/g;
const SEARCH_HASH_REG = /\?|\#/;
/**
 * Normalize path to current os format (system), unix format (unix) or web format (web)
 */
function normalize(path, type = "web") {
    switch (type) {
        case "system": return Path.normalize(path);
        case "unix":
            {
                path = normalize(path, "system");
                path = path.replace(BACKSLASH_REG, "/");
                while (path.match(DOUBLE_BACKSLASH_REG)) {
                    path = path.replace(DOUBLE_BACKSLASH_REG, "/"); // node on windows doesn't replace doubles
                }
                return path;
            }
        case "web":
            {
                path = normalize(path, "unix");
                path = path.replace(CLEAN_URL_REG, "");
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
        system: normalize(path, "system"),
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
/**
 * Create a wrapper around the path
 */
function createWrapper(path) {
    return new PathWrapper(path);
}
exports.createWrapper = createWrapper;
class PathWrapper {
    constructor(path) {
        this.path = path;
        this.path = normalize(path, "system");
    }
    clone() { return new PathWrapper(this.path); }
    raw() { return this.path; }
    toWeb() { return normalize(this.path, "web"); }
    ext() { return Path.extname(this.path); }
    base() { return Path.basename(this.path); }
    name() { return Path.basename(this.path, this.ext()); }
    dir() { return Path.dirname(this.path); }
    isAbsolute() {
        return Path.isAbsolute(this.path);
    }
    join(...parts) {
        return createWrapper(Path.join(this.path, ...parts));
    }
    with(...parts) {
        return this.join(...parts);
    }
    relative(to) {
        return createWrapper(Path.relative(this.path, to));
    }
}
exports.PathWrapper = PathWrapper;
