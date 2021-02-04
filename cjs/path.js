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
exports.URLBuilder = exports.PathBuilder = exports.isValidURL = exports.cleanup = exports.getNormalizedPaths = exports.normalize = void 0;
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
class PathBuilder {
    constructor(path) {
        this.path = path;
        if (typeof path !== "string")
            throw new Error("Path should not be empty");
        this.path = normalize(path, "os");
    }
    clone() { return new PathBuilder(this.path); }
    os() { return normalize(this.path, "os"); }
    unix() { return normalize(this.path, "unix"); }
    web() { return normalize(this.path, "web"); }
    ext() { return Path.extname(this.path); }
    base() { return Path.basename(this.path); }
    name() { return Path.basename(this.path, this.ext()); }
    dir() { return Path.dirname(this.path); }
    set(path) {
        if (typeof path !== "string")
            throw new Error("[asset-pipeline][path] Path should not be empty");
        this.path = path;
        return this;
    }
    isAbsolute() {
        return Path.isAbsolute(this.path);
    }
    join(...parts) {
        return new PathBuilder(Path.join(this.path, ...parts));
    }
    with(...parts) {
        return this.join(...parts);
    }
    relative(to) {
        return new PathBuilder(Path.relative(this.path, to));
    }
    toString(type = "os") {
        return normalize(this.path, type);
    }
}
exports.PathBuilder = PathBuilder;
class URLBuilder {
    constructor(path, _origin = "") {
        this._origin = _origin;
        this.pathname = new PathBuilder(path);
    }
    set(url) {
        if (typeof url !== "string")
            throw new Error(`[asset-pipeline][path] Orign should be a string. An empty string is accepted.`);
        try {
            const u = new URL(url);
            this._origin = u.origin;
            this.setPathname(u.pathname);
        }
        catch (e) {
            this._origin = "";
            this.pathname.set("/");
        }
        return this;
    }
    setOrigin(origin) {
        if (typeof origin !== "string")
            throw new Error(`[asset-pipeline][path] Orign should be a string. An empty string is accepted.`);
        try {
            const u = new URL(this.pathname.unix(), origin);
            this._origin = u.origin;
            this.setPathname(u.pathname);
        }
        catch (e) {
            this._origin = "";
        }
        return this;
    }
    setPathname(path) {
        this.pathname.set(path);
        return this;
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
        if (this.isValidURL()) {
            return this.toURL().href;
        }
        return this.pathname.web();
    }
    toURL() {
        return new URL(this.pathname.toString("web"), this._origin);
    }
}
exports.URLBuilder = URLBuilder;
