"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformRule = void 0;
const minimatch_1 = __importDefault(require("minimatch"));
const path_1 = require("path");
const utils_1 = require("./utils");
const utils_2 = require("./path/utils");
const EXT_REG = /^\./;
class TransformRule {
    constructor(pattern) {
        this.pattern = pattern;
        this.rule = {
            tag: "default",
            priority: 0,
            cachebreak: true
        };
    }
    path(path) {
        this.directory(path_1.dirname(path));
        const parts = path_1.basename(path).split(".");
        const name = parts.shift();
        const extension = parts.join(".");
        if (name)
            this.name(name);
        if (extension)
            this.extension(`.${extension}`);
        return this;
    }
    name(name) {
        this.rule.name = name;
        return this;
    }
    extension(extension) {
        if (!EXT_REG.test(extension)) {
            extension = `.${extension}`;
        }
        this.rule.extension = extension;
        return this;
    }
    directory(directory) {
        this.rule.directory = directory;
        return this;
    }
    baseDirectory(baseDirectory) {
        this.rule.baseDirectory = baseDirectory;
        return this;
    }
    relative(relative) {
        this.rule.relative = relative;
        return this;
    }
    keepDirectory(enable) {
        if (enable) {
            delete this.rule.directory;
        }
        else {
            this.rule.directory = ".";
        }
        return this;
    }
    cachebreak(enable) {
        this.rule.cachebreak = enable;
        return this;
    }
    priority(value) {
        this.rule.priority = value;
        return this;
    }
    tag(tag) {
        this.rule.tag = tag;
        return this;
    }
    match(filename) {
        return minimatch_1.default(filename, this.pattern);
    }
    apply(filename, options) {
        if (!this.match(filename)) {
            throw new Error(`Cannot tranform "${filename}"`);
        }
        const _options = Object.assign({ cachebreak: false, saltKey: "none" }, (options || {}));
        const rule = this.rule;
        let output = filename;
        const hash = utils_1.generateHash(output + _options.saltKey);
        const parsed = path_1.parse(output);
        // Fix ext and name
        const parts = parsed.base.split(".");
        const name = parts.shift();
        parsed.name = name;
        parsed.ext = `.${parts.join(".")}`;
        if (typeof rule.directory === "string" && rule.directory) {
            parsed.dir = rule.directory;
        }
        if (typeof rule.relative === "string" && rule.relative) {
            parsed.dir = path_1.relative(rule.relative, parsed.dir);
        }
        if (typeof rule.baseDirectory === "string" && rule.baseDirectory) {
            parsed.dir = path_1.join(rule.baseDirectory, parsed.dir);
        }
        if (typeof rule.name === "string" && rule.name) {
            parsed.name = rule.name;
        }
        if (_options.cachebreak && rule.cachebreak) {
            parsed.name = `${parsed.name}-${hash}`;
        }
        if (typeof rule.extension === "string" && rule.extension) {
            parsed.ext = rule.extension;
        }
        parsed.base = parsed.name + parsed.ext;
        output = path_1.format(parsed);
        return {
            path: utils_2.normalize(output, "web"),
            tag: rule.tag,
            priority: rule.priority
        };
    }
}
exports.TransformRule = TransformRule;
