"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./utils/fs");
const path_1 = require("path");
const minimatch_1 = __importDefault(require("minimatch"));
const cache_1 = require("./cache");
const string_1 = require("lol/utils/string");
class FilePipeline {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.rules = [];
    }
    get manifest() {
        return this.pipeline.manifest.manifest;
    }
    add(glob, parameters) {
        glob = path_1.normalize(glob);
        parameters = Object.assign({
            glob: glob
        }, parameters || {});
        parameters.glob = glob;
        this.rules.push(parameters);
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
        const globs = [];
        const ignores = [];
        this.rules.forEach((item) => {
            if ("ignore" in item && item.ignore) {
                ignores.push(this.pipeline.fromLoadPath(item.glob));
            }
            else {
                globs.push(this.pipeline.fromLoadPath(item.glob));
            }
        });
        let input;
        fs_1.fetch(globs, ignores)
            .map((file) => {
            return this.pipeline.relativeToLoadPath(file);
        })
            .forEach((input) => {
            this.manifest.assets[input] = {
                input: input,
                output: input,
                cache: input
            };
            this.resolve(input);
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
        if ("alternatives" in rules && rules.alternatives) {
            const item = this.manifest.assets[file];
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
        let cache = output;
        if ((this.pipeline.cacheable && !("cache" in rules))
            ||
                this.pipeline.cacheable && rules.cache) {
            cache = cache_1.hashCache(output, this.pipeline.asset_key);
        }
        if (isAlternative && "alternatives" in this.manifest.assets[file]) {
            const alts = this.manifest.assets[file].alternatives;
            alts.outputs.push({
                data: rules.data,
                output: output,
                cache: cache
            });
        }
        else {
            this.manifest.assets[file].output = output;
            this.manifest.assets[file].cache = cache;
        }
    }
}
exports.FilePipeline = FilePipeline;
