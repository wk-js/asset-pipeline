"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const minimatch_1 = __importDefault(require("minimatch"));
const cache_1 = require("./cache");
const string_1 = require("lol/utils/string");
class FilePipeline {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.rules = [];
        this.type = 'file';
    }
    get manifest() {
        return this.pipeline.manifest.manifest;
    }
    add(glob, parameters = {}) {
        glob = path_1.normalize(glob);
        const params = parameters = Object.assign({
            glob: glob
        }, parameters);
        params.glob = glob;
        this.rules.push(params);
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
        this.pipeline.load_paths
            .fetch(this.rules)
            .forEach((asset) => {
            this.manifest.assets[asset.input] = asset;
            this.resolve(asset.input);
        });
    }
    getRules(file) {
        let rules = {};
        for (let i = 0, ilen = this.rules.length, item, relativeGlob; i < ilen; i++) {
            item = this.rules[i];
            // if (file === item.glob) {
            //   rules = item
            //   break;
            // } else if (minimatch(file, item.glob)) {
            //   rules = Object.assign(rules, item)
            // }
            if (file === item.glob || minimatch_1.default(file, item.glob)) {
                rules = Object.assign(rules, item);
            }
        }
        return rules;
    }
    resolve(file) {
        let rules = this.getRules(file);
        this.resolveOutput(file, rules);
    }
    resolveOutput(file, rules) {
        let output = file, pathObject;
        // Remove path and keep basename only
        if ("keep_path" in rules && !rules.keep_path) {
            output = path_1.basename(output);
        }
        // Rename output basename
        if ("rename" in rules && typeof rules.rename === 'string') {
            pathObject = path_1.parse(output);
            output = path_1.join(path_1.dirname(output), rules.rename);
            output = string_1.template2(output, pathObject);
        }
        // Add base_dir
        if ("base_dir" in rules && typeof rules.base_dir === 'string') {
            output = path_1.join(this.pipeline.dst_path, rules.base_dir, output);
            output = path_1.relative(this.pipeline.dst_path, output);
        }
        // Replace dir path if needed
        pathObject = path_1.parse(output);
        pathObject.dir = this.pipeline.getPath(pathObject.dir);
        output = path_1.format(pathObject);
        if ("resolve" in rules && typeof rules.resolve === 'function') {
            output = rules.resolve(output, file, rules);
        }
        let cache = output;
        if ((this.pipeline.cacheable && !("cache" in rules))
            ||
                this.pipeline.cacheable && rules.cache) {
            if (this.pipeline.cache_type === 'hash') {
                cache = cache_1.hashCache(output, this.pipeline.asset_key);
            }
            else if (this.pipeline.cache_type === 'version' && this.type === 'file') {
                cache = cache_1.versionCache(output, this.pipeline.asset_key);
            }
            else {
                cache = output;
            }
        }
        this.manifest.assets[file].output = output;
        this.manifest.assets[file].cache = cache;
    }
}
exports.FilePipeline = FilePipeline;
