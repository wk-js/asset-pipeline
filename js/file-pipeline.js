"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const cache_1 = require("./cache");
const string_1 = require("lol/utils/string");
const object_1 = require("lol/utils/object");
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
    resolve(asset) {
        // Ignore files registered from directory_pipeline or from previous rules
        if (this.manifest.assets[asset.input] && this.manifest.assets[asset.input].resolved)
            return;
        this.manifest.assets[asset.input] = asset;
        this.resolveOutput(asset.input, object_1.clone(asset.rule));
    }
    resolveOutput(file, rules) {
        let output = file, pathObject;
        // Remove path and keep basename only
        if ("keep_path" in rules && !rules.keep_path) {
            output = path_1.basename(output);
        }
        // Add base_dir
        if ("base_dir" in rules && typeof rules.base_dir === 'string') {
            output = path_1.join(this.pipeline.dst_path, rules.base_dir, output);
            output = path_1.relative(this.pipeline.dst_path, output);
        }
        // Replace dir path if needed
        pathObject = path_1.parse(output);
        pathObject.dir = this.resolver.getPath(pathObject.dir);
        output = path_1.format(pathObject);
        let cache = output;
        if ((this.cacheable && !("cache" in rules))
            ||
                this.cacheable && rules.cache) {
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
        if ("rename" in rules) {
            if (typeof rules.rename === 'function') {
                output = rules.rename(output, file, rules);
                rules.rename = output;
            }
            else if (typeof rules.rename === 'string') {
                pathObject = path_1.parse(output);
                output = string_1.template2(rules.rename, Object.assign({ hash: "" }, pathObject), TemplateOptions);
                output = path_1.normalize(output);
                cache = string_1.template2(rules.rename, Object.assign({ hash: this.cacheable && rules.cache ? cache_1.generateHash(output + this.hash_key) : '' }, pathObject), TemplateOptions);
                cache = path_1.normalize(cache);
            }
        }
        this.manifest.assets[file].output = output;
        this.manifest.assets[file].cache = cache;
        this.manifest.assets[file].resolved = true;
    }
}
exports.FilePipeline = FilePipeline;
