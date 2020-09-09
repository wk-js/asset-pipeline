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
const transform_1 = require("./transform");
const array_1 = require("lol/js/array");
const path_1 = require("./path");
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
        this.rules = new transform_1.Transform();
        this._shadows = [];
        this._globToAdd = [];
        this._globToIgnore = [];
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
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
            source: {
                uuid: '__shadow__',
                path: '__shadow__',
            },
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
            this.rules.resolve(pipeline, asset);
            return asset;
        })
            .forEach((item) => {
            const glob = source.fullpath.join(item.input, '**/*').os();
            // Handle files
            fs_1.fetch(glob).map((file) => {
                const input = source.fullpath.relative(file);
                const pathObject = Path.parse(input.os());
                pathObject.dir = pipeline.getPath(pathObject.dir);
                const output = Path.format(pathObject);
                const rule = this.rules.matchingRule(item.input);
                const asset = {
                    source: item.source,
                    input: input.web(),
                    output: path_1.normalize(output, "web"),
                    cache: path_1.normalize(output, "web"),
                    tag: typeof rule.tag == 'string' ? rule.tag : 'default'
                };
                // Handle rules for files
                if (!(manifest.has(asset.input) && manifest.get(asset.input).resolved)
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
                asset.rule = rule;
                manifest.add(asset);
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
