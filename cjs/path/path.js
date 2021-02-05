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
exports.toPath = exports.toOsString = exports.toWebString = exports.toUnixString = exports.PathBuilder = void 0;
const Path = __importStar(require("path"));
const utils_1 = require("./utils");
class PathBuilder {
    constructor(path) {
        this.path = toOsString(path);
    }
    clone() { return new PathBuilder(this.path); }
    os() { return utils_1.normalize(this.path, "os"); }
    unix() { return utils_1.normalize(this.path, "unix"); }
    web() { return utils_1.normalize(this.path, "web"); }
    ext() { return Path.extname(this.path); }
    base() { return Path.basename(this.path); }
    name() { return Path.basename(this.path, this.ext()); }
    dir() { return Path.dirname(this.path); }
    set(path) {
        this.path = toUnixString(path);
        return this;
    }
    isAbsolute() {
        return Path.isAbsolute(this.path);
    }
    join(...parts) {
        const _parts = parts.map(toUnixString);
        return new PathBuilder(Path.join(this.path, ..._parts));
    }
    with(...parts) {
        return this.join(...parts);
    }
    relative(to) {
        const _to = toUnixString(to);
        return new PathBuilder(Path.relative(this.path, _to));
    }
    toString(type = "os") {
        return utils_1.normalize(this.path, type);
    }
}
exports.PathBuilder = PathBuilder;
function toUnixString(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern.unix();
    }
    else {
        return utils_1.normalize(pattern, "unix");
    }
}
exports.toUnixString = toUnixString;
function toWebString(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern.web();
    }
    else {
        return utils_1.normalize(pattern, "web");
    }
}
exports.toWebString = toWebString;
function toOsString(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern.os();
    }
    else {
        return utils_1.normalize(pattern, "os");
    }
}
exports.toOsString = toOsString;
function toPath(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern;
    }
    else {
        return new PathBuilder(pattern);
    }
}
exports.toPath = toPath;
