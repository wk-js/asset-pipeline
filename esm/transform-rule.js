import { createRule } from "./rule";
import { basename, dirname, format, join, parse, relative } from "path";
import { generateHash } from "./utils";
import { normalize } from "./path/utils";
const EXT_REG = /^\./;
export const CreateTransformRule = createRule({
    options: {
        tag: "default",
        cachebreak: true
    },
    api: {
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
            this.options.directory = dirname(path);
            const parts = basename(path).split(".");
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
            const hash = generateHash(output + _options.saltKey);
            const parsed = parse(output);
            // Fix ext and name
            const parts = parsed.base.split(".");
            const name = parts.shift();
            parsed.name = name;
            parsed.ext = `.${parts.join(".")}`;
            if (typeof rule.directory === "string" && rule.directory) {
                parsed.dir = rule.directory;
            }
            if (typeof rule.relative === "string" && rule.relative) {
                parsed.dir = relative(rule.relative, parsed.dir);
            }
            if (typeof rule.baseDirectory === "string" && rule.baseDirectory) {
                parsed.dir = join(rule.baseDirectory, parsed.dir);
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
            output = format(parsed);
            return {
                path: normalize(output, "web"),
                tag: rule.tag,
                priority: rule.priority
            };
        }
    }
});
