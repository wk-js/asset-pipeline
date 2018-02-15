"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("wkt/js/api/file/utils");
const path_1 = require("path");
const minimatch_1 = __importDefault(require("minimatch"));
const cache_1 = require("./cache");
class FilePipeline {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this._globs = [];
    }
    get manifest() {
        return this.pipeline.manifest.manifest;
    }
    add(glob, parameters) {
        glob = this.pipeline.fromLoadPath(path_1.normalize(glob));
        parameters = Object.assign({
            glob: glob
        }, parameters || {});
        this._globs.push(parameters);
    }
    ignore(glob) {
        glob = this.pipeline.fromLoadPath(path_1.normalize(glob));
        const parameters = {
            glob: glob,
            ignore: true
        };
        this._globs.push(parameters);
    }
    fetch() {
        const globs = [];
        const ignores = [];
        this._globs.forEach((item) => {
            if ("ignore" in item && item.ignore) {
                ignores.push(item.glob);
            }
            else {
                globs.push(item.glob);
            }
        });
        let input;
        utils_1.fetch(globs, ignores)
            .map((file) => {
            return this.pipeline.relativeToLoadPath(file);
        })
            .forEach((input) => {
            this.manifest.ASSETS[input] = {
                input: input,
                output: input,
                cache: input
            };
            this.resolve(input);
        });
    }
    getRules(file) {
        let rules = {};
        for (let i = 0, ilen = this._globs.length, item, relativeGlob; i < ilen; i++) {
            item = this._globs[i];
            relativeGlob = this.pipeline.relativeToLoadPath(item.glob);
            if (file === relativeGlob) {
                rules = item;
                break;
            }
            else if (minimatch_1.default(file, relativeGlob)) {
                rules = Object.assign(rules, item);
            }
        }
        return rules;
    }
    resolve(file) {
        let rules = this.getRules(file);
        this.resolveOutput(file, rules);
        if ("alternatives" in rules && rules.alternatives) {
            const item = this.manifest.ASSETS[file];
            item.alternatives = {
                condition: rules.alternatives.condition,
                outputs: []
            };
            rules.alternatives.outputs.forEach((alt) => {
                rules = Object.assign(rules, alt);
                this.resolveOutput(file, rules, true);
            });
        }
    }
    resolveOutput(file, rules, isAlternative) {
        let output = file, pathObject;
        // Remove path and keep basename only
        if ("keep_path" in rules && !rules.keep_path) {
            output = path_1.basename(output);
        }
        // Rename output basename
        if ("rename" in rules && typeof rules.rename === 'string') {
            pathObject = path_1.parse(output);
            pathObject.base = rules.rename;
            output = path_1.format(pathObject);
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
        let cache = output;
        if ((this.pipeline.cacheable && !("cache" in rules))
            ||
                this.pipeline.cacheable && rules.cache) {
            cache = cache_1.hashCache(output, this.pipeline.asset_key);
        }
        if (isAlternative && "alternatives" in this.manifest.ASSETS[file]) {
            const alts = this.manifest.ASSETS[file].alternatives;
            alts.outputs.push({
                data: rules.data,
                output: output,
                cache: cache
            });
        }
        else {
            this.manifest.ASSETS[file].output = output;
            this.manifest.ASSETS[file].cache = cache;
        }
    }
}
exports.FilePipeline = FilePipeline;
