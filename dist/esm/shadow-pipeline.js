import { omit } from "lol/js/object";
import { normalize } from "./path";
import { PipelineManager } from "./pipeline";
import { transform } from "./transform";
export class ShadowPipeline {
    constructor(pid) {
        this.pid = pid;
        this._rules2 = {};
    }
    get pipeline() {
        return PipelineManager.get(this.pid);
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
            const transformed = transform(pipeline, {
                source: {
                    uuid: "__shadow__",
                    path: "__shadow__",
                },
                input: normalize(inputPath, "web"),
                output: normalize(inputPath, "web"),
                tag: "default",
                type: rule.type,
                resolved: false,
            }, [omit(rule, "type")]);
            pipeline.manifest.addAsset(transformed);
        });
    }
}
