"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transform_1 = require("./transform");
const fs_1 = require("lol/js/node/fs");
class FilePipeline {
    constructor(_source) {
        this._source = _source;
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
            source: '__shadow__',
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
    fetch(pipeline) {
        this._fetch(pipeline).forEach((asset) => {
            this.rules.resolve(pipeline, asset);
        });
        return this;
    }
    _fetch(pipeline) {
        const globs = [];
        const ignores = [];
        const source = pipeline.source.get(this._source);
        if (!source)
            return [];
        this._globToAdd.forEach(pattern => {
            const glob = source.join(pipeline.resolve, pattern, true);
            globs.push(glob);
        });
        this._globToIgnore.forEach(pattern => {
            const ignore = source.join(pipeline.resolve, pattern, true);
            ignores.push(ignore);
        });
        const fetcher = this._fetcher();
        const assets = fetcher(globs, ignores)
            .map((file) => {
            const input = pipeline.resolve.relative(this._source, file);
            return {
                source: pipeline.resolve.relative(pipeline.resolve.root(), this._source),
                input: input,
                output: input,
                cache: input,
                resolved: false
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
