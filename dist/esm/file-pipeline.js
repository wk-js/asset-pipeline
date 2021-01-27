import { PipelineManager } from "./pipeline";
import { fetch } from "lol/js/node/fs";
import minimatch from "minimatch";
import { clone } from "lol/js/object";
import { transform } from "./transform";
export class FilePipeline {
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
        return PipelineManager.get(this.pid);
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
        file._rules = clone(this._rules);
        return file;
    }
    /**
     * Collect a list of files matching patterns, then apply transformation rules, then add to manifest
     */
    fetch() {
        if (!this.pipeline)
            return;
        const pipeline = this.pipeline;
        this._fetch().forEach(asset => {
            const rule = asset.rule;
            const transformed = transform(pipeline, asset, [rule]);
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
        const manifest = this.pipeline.manifest;
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
        const map = new Map();
        const fetcher = this._fetcher();
        for (const [pattern, rule] of globs) {
            fetcher([pattern], []).forEach(file => {
                const input = source.fullpath.relative(file).web();
                if (!map.has(input) && !manifest.hasAsset(input)) {
                    map.set(input, {
                        source: {
                            uuid: source.uuid,
                            path: source.path.web(),
                        },
                        input: input,
                        output: input,
                        resolved: false,
                        type: this.type,
                        tag: "default",
                        rule
                    });
                }
            });
        }
        const assets = [...map.values()].filter(asset => {
            for (const [pattern] of ignores) {
                if (minimatch(asset.input, pattern))
                    return false;
            }
            return true;
        });
        return assets;
    }
    _fetcher() {
        return function (globs, ignores) {
            try {
                return fetch(globs, ignores);
            }
            catch (e) { }
            return [];
        };
    }
}
