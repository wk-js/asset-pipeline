"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePipeline = void 0;
const pipeline_1 = require("./pipeline");
const transform_1 = require("./transform");
const fs_1 = require("lol/js/node/fs");
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
        this.rules = new transform_1.Transform();
        this._shadows = [];
        this._globToAdd = [];
        this._globToIgnore = [];
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    get source() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.source.get(this.sid);
    }
    get resolver() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.resolve;
    }
    /**
     * Add file pattern
     */
    add(pattern, transformRule) {
        this._globToAdd.push(pattern);
        if (transformRule)
            this.rules.add(pattern, transformRule);
        return this;
    }
    /**
     * Add file pattern to ignore
     */
    ignore(pattern) {
        this._globToIgnore.push(pattern);
        return this;
    }
    /**
     * Add non-existing file to the manifest. Rules are applied.
     */
    shadow(file, transformRule) {
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
        if (transformRule)
            this.rules.add(file, transformRule);
        return this;
    }
    /**
     * Clone the pipeline
     */
    clone(file) {
        file._shadows = this._shadows.slice(0);
        this.rules.clone(file.rules);
        return file;
    }
    /**
     * Collect a list of files matching patterns, then apply transformation rules
     */
    fetch() {
        if (!this.pipeline)
            return;
        const pipeline = this.pipeline;
        this._fetch().forEach((asset) => {
            this.rules.resolve(pipeline, asset);
        });
    }
    _fetch() {
        if (!this.source || !this.resolver)
            return [];
        const source = this.source;
        const resolver = this.resolver;
        const globs = [];
        const ignores = [];
        this._globToAdd.forEach(pattern => {
            const glob = source.fullpath.join(pattern).raw();
            globs.push(glob);
        });
        this._globToIgnore.forEach(pattern => {
            const ignore = source.fullpath.join(pattern).raw();
            ignores.push(ignore);
        });
        const fetcher = this._fetcher();
        const assets = fetcher(globs, ignores)
            .map((file) => {
            const input = source.fullpath.relative(file);
            return {
                source: {
                    uuid: source.uuid,
                    path: source.path.toWeb(),
                },
                input: input.toWeb(),
                output: input.toWeb(),
                cache: input.toWeb(),
                resolved: false,
            };
        })
            .filter((asset) => asset != null);
        return this._shadows.concat(assets);
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
