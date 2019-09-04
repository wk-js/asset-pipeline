"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("lol/js/node/fs");
const file_pipeline_1 = require("./file-pipeline");
const minimatch_1 = __importDefault(require("minimatch"));
const path_2 = require("./utils/path");
const transform_1 = require("./transform");
const array_1 = require("lol/js/array");
class DirectoryPipeline {
    constructor() {
        /**
         * Pipeline type
         */
        this.type = 'directory';
        /**
         * Transformation rules
         */
        this.rules = new transform_1.Transform();
        this._shadows = [];
        this._globToAdd = [];
        this._globToIgnore = [];
    }
    /**
     * Append file pattern
     */
    add(pattern, transformRule) {
        this._globToAdd.push(pattern);
        if (transformRule)
            this.rules.add(pattern, transformRule);
    }
    /**
     * Append file pattern to ignore
     */
    ignore(pattern) {
        this._globToIgnore.push(pattern);
    }
    /**
     * Append non-existing file to the manifest. Rules are applied.
     */
    shadow(file) {
        this._shadows.push({
            source: '__shadow__',
            input: file,
            output: file,
            cache: file,
            tag: 'default',
            resolved: false
        });
    }
    /**
     * Clone the pipeline
     */
    clone(directory) {
        directory._shadows = this._shadows.slice(0);
        this.rules.clone(directory.rules);
        return directory;
    }
    fetch(pipeline) {
        this._fetch(pipeline)
            .map((asset) => {
            this.rules.resolve(pipeline, asset);
            return asset;
        })
            .forEach((item) => {
            const glob = pipeline.source.with(item.source, item.input, true) + '/**/*';
            // Handle files
            fs_1.fetch(glob).map((input) => {
                input = pipeline.resolve.relative(item.source, input);
                const pathObject = path_1.default.parse(input);
                pathObject.dir = pipeline.resolve.path(pathObject.dir);
                const output = path_1.default.format(pathObject);
                const rule = this.rules.matchingRule(item.input);
                const asset = {
                    source: item.source,
                    input: path_2.cleanPath(input),
                    output: path_2.cleanPath(output),
                    cache: path_2.cleanPath(output),
                    tag: typeof rule.tag == 'string' ? rule.tag : 'default'
                };
                // Handle rules for files
                if (!(pipeline.manifest.has(asset.input) && pipeline.manifest.get(asset.input).resolved)
                    && rule.file_rules
                    && rule.file_rules.length > 0) {
                    for (let i = 0; i < rule.file_rules.length; i++) {
                        const r = rule.file_rules[i];
                        if (!r.ignore && minimatch_1.default(asset.input, r.glob || asset.input)) {
                            asset.rule = r;
                            this.rules.resolve(pipeline, asset);
                        }
                    }
                    return;
                }
                asset.resolved = true;
                pipeline.manifest.set(asset);
            });
        });
    }
    _fetch(pipeline) {
        // @ts-ignore
        return file_pipeline_1.FilePipeline.prototype._fetch.call(this, pipeline);
    }
    _fetcher() {
        return function (globs, ignores) {
            try {
                return array_1.unique(fs_1.fetchDirs(globs, ignores));
            }
            catch (e) { }
            return [];
        };
    }
}
exports.DirectoryPipeline = DirectoryPipeline;
