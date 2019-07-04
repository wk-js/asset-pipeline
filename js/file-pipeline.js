"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const string_1 = require("lol/utils/string");
const object_1 = require("lol/utils/object");
const minimatch_1 = __importDefault(require("minimatch"));
const path_2 = require("./utils/path");
const array_1 = require("lol/utils/array");
const fs_1 = require("./utils/fs");
const TemplateOptions = {
    open: '#{',
    body: '[a-z@$#-_?!]+',
    close: '}'
};
class FilePipeline {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.rules = [];
        this.type = 'file';
    }
    add(glob, parameters = {}) {
        glob = path_2.cleanPath(glob);
        const params = parameters = Object.assign({
            glob: glob
        }, parameters);
        params.glob = glob;
        this.rules.push(params);
    }
    addEntry(input, output, parameters = {}) {
        parameters = Object.assign({
            rename: output,
            keep_path: false
        }, parameters);
        this.add(input, parameters);
    }
    ignore(glob) {
        glob = path_2.cleanPath(glob);
        const parameters = {
            glob: glob,
            ignore: true
        };
        this.rules.push(parameters);
    }
    clone(file) {
        for (let i = 0; i < this.rules.length; i++) {
            const glob = this.rules[i];
            file.rules.push(glob);
        }
        return file;
    }
    fetch() {
        this._fetch().forEach(this.resolve.bind(this));
    }
    _fetch() {
        const fetcher = this._fetcher(this.type);
        const globs = [];
        const ignores = [];
        for (let i = 0; i < this.rules.length; i++) {
            const rule = this.rules[i];
            this.pipeline.source.all(true).forEach((source) => {
                if ("ignore" in rule && rule.ignore) {
                    ignores.push(this.pipeline.source.with(source, rule.glob, true));
                }
                else {
                    globs.push(this.pipeline.source.with(source, rule.glob, true));
                }
            });
        }
        const assets = fetcher(globs, ignores)
            .map((file) => {
            const source = this.pipeline.source.find_from_input(file, true);
            const input = this.pipeline.resolve.relative(source, file);
            return {
                source: this.pipeline.resolve.relative(this.pipeline.resolve.root(), source),
                input: input,
                output: input,
                cache: input,
                resolved: false
            };
        });
        return assets;
    }
    _fetcher(type = "file") {
        return function (globs, ignores) {
            try {
                if (type == "file") {
                    return fs_1.fetch(globs, ignores);
                }
                else {
                    return array_1.unique(fs_1.fetchDirs(globs, ignores));
                }
            }
            catch (e) { }
            return [];
        };
    }
    findRule(path) {
        for (let i = 0, ilen = this.rules.length; i < ilen; i++) {
            const rule = this.rules[i];
            if (path === rule.glob || minimatch_1.default(path, rule.glob)) {
                return rule;
            }
        }
        return { glob: path + '/**/*' };
    }
    resolve(asset) {
        // Ignore files registered from directory_pipeline or from previous rules
        const masset = this.pipeline.manifest.get(asset.input);
        if (masset && masset.resolved)
            return;
        const rule = asset.rule || this.findRule(asset.input);
        this.pipeline.manifest.set(asset);
        this.resolveOutput(asset.input, object_1.clone(rule));
    }
    resolveOutput(file, rule) {
        let output = file, pathObject;
        // Remove path and keep basename only
        if ("keep_path" in rule && !rule.keep_path) {
            output = path_1.basename(output);
        }
        // Add base_dir
        if ("base_dir" in rule && typeof rule.base_dir === 'string') {
            output = path_1.join(this.pipeline.resolve.output(), rule.base_dir, output);
            output = path_1.relative(this.pipeline.resolve.output(), output);
        }
        // Replace dir path if needed
        pathObject = path_1.parse(output);
        pathObject.dir = this.pipeline.resolve.path(pathObject.dir);
        output = path_1.format(pathObject);
        let cache = output;
        if ((this.pipeline.cache.enabled && !("cache" in rule))
            ||
                this.pipeline.cache.enabled && rule.cache) {
            if (this.pipeline.cache.type === 'hash') {
                cache = this.pipeline.cache.hash(output);
            }
            else if (this.pipeline.cache.type === 'version' && this.type === 'file') {
                cache = this.pipeline.cache.version(output);
            }
            else {
                cache = output;
            }
        }
        // Rename output
        if ("rename" in rule) {
            if (typeof rule.rename === 'function') {
                output = rule.rename(output, file, rule);
                rule.rename = output;
            }
            else if (typeof rule.rename === 'string') {
                pathObject = path_1.parse(output);
                output = string_1.template2(rule.rename, Object.assign({ hash: "" }, pathObject), TemplateOptions);
                cache = string_1.template2(rule.rename, Object.assign({ hash: this.pipeline.cache.enabled && rule.cache ? this.pipeline.cache.generateHash(output + this.pipeline.cache.key) : '' }, pathObject), TemplateOptions);
            }
        }
        const asset = this.pipeline.manifest.get(file);
        asset.input = path_2.cleanPath(asset.input);
        asset.output = path_2.cleanPath(output);
        asset.cache = path_2.cleanPath(cache);
        asset.resolved = true;
        asset.rule = rule;
        this.pipeline.manifest.set(asset);
    }
}
exports.FilePipeline = FilePipeline;
