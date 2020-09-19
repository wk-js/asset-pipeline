"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePipeline = void 0;
const pipeline_1 = require("./pipeline");
const fs_1 = require("lol/js/node/fs");
const minimatch_1 = __importDefault(require("minimatch"));
const object_1 = require("lol/js/object");
const transform_1 = require("./transform");
class FilePipeline {
    constructor(pid, sid) {
        this.pid = pid;
        this.sid = sid;
        /**
         * Pipeline type
         */
        this.type = 'file';
        /**
         * Transformation rules
         */
        this._rules = {};
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    /**
     * Add file pattern
     */
    add(pattern, transformRule) {
        this._rules[pattern] = Object.assign({
            glob: pattern
        }, transformRule || {});
        return this;
    }
    /**
     * Add file pattern to ignore
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
    clone(file) {
        file._rules = object_1.clone(this._rules);
        return file;
    }
    /**
     * Collect a list of files matching patterns, then apply transformation rules
     */
    fetch() {
        if (!this.pipeline)
            return;
        const pipeline = this.pipeline;
        this._fetch().forEach(asset => {
            const rule = asset.rule;
            const transformed = transform_1.transform(pipeline, asset, [rule]);
            pipeline.manifest.addAsset(transformed);
        });
    }
    _fetch() {
        if (!this.pipeline)
            return [];
        const pipeline = this.pipeline;
        const source = pipeline.source.get(this.sid);
        if (!source)
            return [];
        const globs = [];
        const ignores = [];
        for (const entry of Object.entries(this._rules)) {
            if (entry[1].ignore) {
                ignores.push(entry);
            }
            else {
                const glob = source.fullpath.join(entry[0]).os();
                globs.push([glob, entry[1]]);
            }
        }
        let assets = [];
        const fetcher = this._fetcher();
        for (const [pattern, rule] of globs) {
            fetcher([pattern], []).forEach(file => {
                const input = source.fullpath.relative(file);
                assets.push({
                    source: {
                        uuid: source.uuid,
                        path: source.path.web(),
                    },
                    input: input.web(),
                    output: input.web(),
                    resolved: false,
                    type: this.type,
                    tag: "default",
                    rule
                });
            });
        }
        assets = assets.filter(asset => {
            for (const [pattern] of ignores) {
                if (minimatch_1.default(asset.input, pattern))
                    return false;
            }
            return true;
        });
        return assets;
    }
    _fetcher() {
        return function (globs, ignores) {
            try {
                return fs_1.fetch(globs, ignores);
            }
            catch (e) { }
            return [];
        };
    }
}
exports.FilePipeline = FilePipeline;
