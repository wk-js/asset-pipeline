"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transform_1 = require("./transform");
const fs_1 = require("lol/js/node/fs");
class FilePipeline {
    constructor() {
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
    }
    /**
     * Add file pattern to ignore
     */
    ignore(pattern) {
        this._globToIgnore.push(pattern);
    }
    /**
     * Add non-existing file to the manifest. Rules are applied.
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
    }
    _fetch(pipeline) {
        const globs = [];
        const ignores = [];
        pipeline.source.all(true).forEach((source) => {
            this._globToAdd.forEach((pattern) => {
                globs.push(pipeline.source.with(source, pattern, true));
            });
            this._globToIgnore.forEach((pattern) => {
                ignores.push(pipeline.source.with(source, pattern, true));
            });
        });
        const fetcher = this._fetcher();
        const assets = fetcher(globs, ignores)
            .map((file) => {
            const source = pipeline.source.find_from_input(file, true);
            if (source) {
                const input = pipeline.resolve.relative(source, file);
                return {
                    source: pipeline.resolve.relative(pipeline.resolve.root(), source),
                    input: input,
                    output: input,
                    cache: input,
                    resolved: false
                };
            }
            return null;
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
