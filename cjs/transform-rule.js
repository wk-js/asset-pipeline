"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransformRule = void 0;
const rule_1 = require("./rule");
const path_1 = require("path");
const utils_1 = require("./utils");
const utils_2 = require("./path/utils");
const EXT_REG = /^\./;
exports.CreateTransformRule = rule_1.createRule({
    options() {
        return {
            tag: "default",
            cachebreak: true
        };
    },
    methods: {
        name(name) {
            this.options.name = name;
            return this;
        },
        directory(directory) {
            this.options.directory = directory;
            return this;
        },
        baseDirectory(baseDirectory) {
            this.options.baseDirectory = baseDirectory;
            return this;
        },
        relative(relative) {
            this.options.relative = relative;
            return this;
        },
        cachebreak(enable) {
            this.options.cachebreak = enable;
            return this;
        },
        path(path) {
            this.options.directory = path_1.dirname(path);
            const parts = path_1.basename(path).split(".");
            const name = parts.shift();
            const extension = parts.join(".");
            if (name)
                this.options.name = name;
            if (extension)
                this.extension(`.${extension}`);
            return this;
        },
        extension(extension) {
            if (!EXT_REG.test(extension)) {
                extension = `.${extension}`;
            }
            this.options.extension = extension;
            return this;
        },
        keepDirectory(enable) {
            if (enable) {
                delete this.options.directory;
            }
            else {
                this.options.directory = ".";
            }
            return this;
        },
        apply(filename, options) {
            if (!this.match(filename)) {
                throw new Error(`Cannot tranform "${filename}"`);
            }
            const _options = Object.assign({ cachebreak: false, saltKey: "none" }, (options || {}));
            const rule = this.options;
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
});
