"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryPipeline = void 0;
const Path = __importStar(require("path"));
const fs_1 = require("lol/js/node/fs");
const file_pipeline_1 = require("./file-pipeline");
const minimatch_1 = __importDefault(require("minimatch"));
const pipeline_1 = require("./pipeline");
const array_1 = require("lol/js/array");
const path_1 = require("./path");
const object_1 = require("lol/js/object");
const transform_1 = require("./transform");
class DirectoryPipeline {
    constructor(pid, sid) {
        this.pid = pid;
        this.sid = sid;
        /**
         * Pipeline type
         */
        this.type = 'directory';
        /**
         * Transformation rules
         */
        this._rules = {};
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    /**
     * Append file pattern
     */
    add(pattern, transformRule) {
        this._rules[pattern] = Object.assign({
            glob: pattern
        }, transformRule || {});
        return this;
    }
    /**
     * Append file pattern to ignore
     */
    ignore(pattern) {
        this._rules[pattern] = {
            glob: pattern,
            ignore: true
        };
        return this;
    }
    /**
     * Clone the pipeline
     */
    clone(directory) {
        directory._rules = object_1.clone(this._rules);
        return directory;
    }
    /**
     * Collect a list of directories matching patterns, apply transformation rules, then add to manifest
     */
    fetch() {
        if (!this.pipeline)
            return;
        const pipeline = this.pipeline;
        const source = pipeline.source.get(this.sid);
        if (!source)
            return;
        const { manifest } = this.pipeline;
        this._fetch()
            .map((asset) => {
            const rule = asset.rule;
            const transformed = transform_1.transform(pipeline, asset, [rule]);
            pipeline.manifest.addAsset(transformed);
            return transformed;
        })
            .forEach((item) => {
            const glob = source.fullpath.join(item.input, '**/*').os();
            const ignore = Object.entries(this._rules)
                .filter(e => e[1].ignore)
                .map(e => e[0]);
            // Handle files
            fs_1.fetch(glob, ignore).map((file) => {
                const input = source.fullpath.relative(file);
                const pathObject = Path.parse(input.os());
                pathObject.dir = pipeline.getPath(pathObject.dir);
                const output = Path.format(pathObject);
                const rule = item.rule;
                const asset = {
                    source: item.source,
                    input: input.web(),
                    output: path_1.normalize(output, "web"),
                    tag: typeof rule.tag == 'string' ? rule.tag : 'default',
                    type: "file",
                };
                const registered = manifest.getAsset(asset.input);
                if (!(registered && registered.resolved)
                    && Array.isArray(rule.fileRules)
                    && rule.fileRules.length > 0) {
                    for (const fileRule of rule.fileRules) {
                        if (!fileRule.ignore && minimatch_1.default(asset.input, fileRule.glob || asset.input)) {
                            asset.rule = fileRule;
                            const transformed = transform_1.transform(pipeline, asset, [asset.rule]);
                            pipeline.manifest.addAsset(transformed);
                        }
                    }
                }
                else {
                    const transformed = transform_1.transform(pipeline, asset, []);
                    pipeline.manifest.addAsset(transformed);
                }
            });
        });
    }
    _fetch() {
        return file_pipeline_1.FilePipeline.prototype["_fetch"].call(this);
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
