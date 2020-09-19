"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowPipeline = void 0;
const object_1 = require("lol/js/object");
const path_1 = require("./path");
const pipeline_1 = require("./pipeline");
const transform_1 = require("./transform");
class ShadowPipeline {
    constructor(pid) {
        this.pid = pid;
        this._rules2 = {};
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    /**
     * Add a file to the manifest without resolving
     */
    addFile(inputPath, transformRule = {}) {
        return this._add(inputPath, Object.assign({ type: "file" }, transformRule));
    }
    /**
     * Add a directory to the manifest without resolving
     */
    addDirectory(inputPath, transformRule = {}) {
        return this._add(inputPath, Object.assign({ type: "file" }, transformRule));
    }
    _add(inputPath, transformRule = { type: "file" }) {
        this._rules2[inputPath] = Object.assign({ glob: inputPath }, transformRule);
        return this;
    }
    fetch() {
        if (!this.pipeline)
            return [];
        const pipeline = this.pipeline;
        return Object.entries(this._rules2).map(([inputPath, rule]) => {
            const transformed = transform_1.transform(pipeline, {
                source: {
                    uuid: "__shadow__",
                    path: "__shadow__",
                },
                input: path_1.normalize(inputPath, "web"),
                output: path_1.normalize(inputPath, "web"),
                tag: "default",
                type: rule.type,
                resolved: false,
            }, [object_1.omit(rule, "type")]);
            pipeline.manifest.addAsset(transformed);
        });
    }
}
exports.ShadowPipeline = ShadowPipeline;
