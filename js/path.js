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
exports.URLBuilder = exports.PathBuilder = exports.cleanup = exports.getNormalizedPaths = exports.normalize = void 0;
const Path = __importStar(require("path"));
const WIN32_SEP_REG = /\\/g;
const DOUBLE_BACKSLASH_REG = /\/\//;
const CLEAN_URL_REG = /^\.\/|\/$/g;
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
class PathBuilder {
    constructor(_path) {
        this._path = _path;
        this._path = normalize(_path, "os");
    }
    clone() { return new PathBuilder(this._path); }
    os() { return normalize(this._path, "os"); }
    unix() { return normalize(this._path, "unix"); }
    web() { return normalize(this._path, "web"); }
    ext() { return Path.extname(this._path); }
    base() { return Path.basename(this._path); }
    name() { return Path.basename(this._path, this.ext()); }
    dir() { return Path.dirname(this._path); }
    set(path) { this._path = path; }
    isAbsolute() {
        return Path.isAbsolute(this._path);
    }
    join(...parts) {
        return new PathBuilder(Path.join(this._path, ...parts));
    }
    with(...parts) {
        return this.join(...parts);
    }
    relative(to) {
        return new PathBuilder(Path.relative(this._path, to));
    }
    toString(type = "os") {
        return normalize(this._path, type);
    }
}
exports.PathBuilder = PathBuilder;
class URLBuilder {
    constructor(_path, _origin = "") {
        this._origin = _origin;
        this.pathname = new PathBuilder(_path);
    }
    setOrigin(_origin) {
        this._origin = _origin;
    }
    setPathname(_path) {
        this.pathname["_path"] = _path;
    }
    isValidURL() {
        try {
            new URL(this.pathname.toString("web"), this._origin);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    clone() { return new URLBuilder(this.pathname.web(), this._origin); }
    join(...parts) {
        return new URLBuilder(this.pathname.join(...parts).web(), this._origin);
    }
    with(...parts) {
        return this.join(...parts);
    }
    relative(to) {
        return new URLBuilder(this.pathname.relative(to).web(), this._origin);
    }
    toString() {
        return this._origin + this.pathname.web();
    }
    toURL() {
        return new URL(this.pathname.toString("web"), this._origin);
    }
}
exports.URLBuilder = URLBuilder;
