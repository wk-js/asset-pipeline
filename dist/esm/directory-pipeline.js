import * as Path from "path";
import { fetch, fetchDirs } from "lol/js/node/fs";
import { FilePipeline } from "./file-pipeline";
import minimatch from "minimatch";
import { PipelineManager } from "./pipeline";
import { unique } from "lol/js/array";
import { normalize } from "./path";
import { clone } from "lol/js/object";
import { transform } from "./transform";
export class DirectoryPipeline {
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
        return PipelineManager.get(this.pid);
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
        directory._rules = clone(this._rules);
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
            const transformed = transform(pipeline, asset, [rule]);
            pipeline.manifest.addAsset(transformed);
            return transformed;
        })
            .forEach((item) => {
            const glob = source.fullpath.join(item.input, '**/*').os();
            const ignore = Object.entries(this._rules)
                .filter(e => e[1].ignore)
                .map(e => e[0]);
            // Handle files
            fetch(glob, ignore).map((file) => {
                const input = source.fullpath.relative(file);
                const pathObject = Path.parse(input.os());
                pathObject.dir = pipeline.getPath(pathObject.dir);
                const output = Path.format(pathObject);
                const rule = item.rule;
                const asset = {
                    source: item.source,
                    input: input.web(),
                    output: normalize(output, "web"),
                    tag: typeof rule.tag == 'string' ? rule.tag : 'default',
                    type: "file",
                };
                const registered = manifest.getAsset(asset.input);
                if (!(registered && registered.resolved)
                    && Array.isArray(rule.fileRules)
                    && rule.fileRules.length > 0) {
                    for (const fileRule of rule.fileRules) {
                        if (!fileRule.ignore && minimatch(asset.input, fileRule.glob || asset.input)) {
                            asset.rule = fileRule;
                            const transformed = transform(pipeline, asset, [asset.rule]);
                            pipeline.manifest.addAsset(transformed);
                        }
                    }
                }
                else {
                    const transformed = transform(pipeline, asset, []);
                    pipeline.manifest.addAsset(transformed);
                }
            });
        });
    }
    _fetch() {
        return FilePipeline.prototype["_fetch"].call(this);
    }
    _fetcher() {
        return function (globs, ignores) {
            try {
                return unique(fetchDirs(globs, ignores));
            }
            catch (e) { }
            return [];
        };
    }
}
