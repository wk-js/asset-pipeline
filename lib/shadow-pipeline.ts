import { omit } from "lol/js/object";
import { normalize } from "./path";
import { PipelineManager } from "./pipeline";
import { transform } from "./transform";
import { IShadowRule } from "./types";

export class ShadowPipeline {

  protected _rules2: Record<string, IShadowRule> = {}

  constructor(private pid: string) {}

  private get pipeline() {
    return PipelineManager.get(this.pid)
  }

  /**
   * Add a file to the manifest without resolving
   */
  addFile(inputPath: string, transformRule: Pick<IShadowRule, "output" | "cache" | "tag"> = {}) {
    return this._add(inputPath, {
      type: "file",
      ...transformRule
    })
  }

  /**
   * Add a directory to the manifest without resolving
   */
  addDirectory(inputPath: string, transformRule: Pick<IShadowRule, "output" | "cache" | "tag"> = {}) {
    return this._add(inputPath, {
      type: "file",
      ...transformRule
    })
  }

  private _add(inputPath: string, transformRule: Pick<IShadowRule, "output" | "cache" | "tag" | "type"> = { type: "file" }) {
    this._rules2[inputPath] = {
      glob: inputPath,
      ...transformRule
    }
    return this
  }

  fetch() {
    if (!this.pipeline) return []
    const pipeline = this.pipeline
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
      }, [omit(rule, "type")])
      pipeline.manifest.addAsset(transformed)
    })
  }

}