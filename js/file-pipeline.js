"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const cache_1 = require("./cache");
const string_1 = require("lol/utils/string");
const object_1 = require("lol/utils/object");
const minimatch = require("minimatch");
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
    get manifest() {
        return this.pipeline.manifest.manifest;
    }
    get cacheable() {
        return this.pipeline.cacheable;
    }
    get cache_type() {
        return this.pipeline.cache_type;
    }
    get hash_key() {
        return this.pipeline.hash_key;
    }
    get load_paths() {
        return this.pipeline.load_paths;
    }
    get resolver() {
        return this.pipeline.resolver;
    }
    add(glob, parameters = {}) {
        glob = path_1.normalize(glob);
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
        glob = path_1.normalize(glob);
        const parameters = {
            glob: glob,
            ignore: true
        };
        this.rules.push(parameters);
    }
    fetch() {
        this.load_paths
            .fetch(this.rules)
            .forEach(this.resolve.bind(this));
    }
    findRule(path) {
        for (let i = 0, ilen = this.rules.length; i < ilen; i++) {
            const rule = this.rules[i];
            if (path === rule.glob || minimatch(path, rule.glob)) {
                return rule;
            }
        }
        return { glob: path };
    }
    resolve(asset) {
        // Ignore files registered from directory_pipeline or from previous rules
        if (this.manifest.assets[asset.input] && this.manifest.assets[asset.input].resolved)
            return;
        const rule = asset.rule || this.findRule(asset.input);
        this.manifest.assets[asset.input] = asset;
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
            output = path_1.join(this.pipeline.dst_path, rule.base_dir, output);
            output = path_1.relative(this.pipeline.dst_path, output);
        }
        // Replace dir path if needed
        pathObject = path_1.parse(output);
        pathObject.dir = this.resolver.getPath(pathObject.dir);
        output = path_1.format(pathObject);
        let cache = output;
        if ((this.cacheable && !("cache" in rule))
            ||
                this.cacheable && rule.cache) {
            if (this.cache_type === 'hash') {
                cache = cache_1.hashCache(output, this.hash_key);
            }
            else if (this.cache_type === 'version' && this.type === 'file') {
                cache = cache_1.versionCache(output, this.hash_key);
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
                output = path_1.normalize(output);
                cache = string_1.template2(rule.rename, Object.assign({ hash: this.cacheable && rule.cache ? cache_1.generateHash(output + this.hash_key) : '' }, pathObject), TemplateOptions);
                cache = path_1.normalize(cache);
            }
        }
        this.manifest.assets[file].output = output;
        this.manifest.assets[file].cache = cache;
        this.manifest.assets[file].resolved = true;
        this.manifest.assets[file].rule = rule;
    }
}
exports.FilePipeline = FilePipeline;
