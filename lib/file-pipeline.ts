import { PipelineManager } from "./pipeline"
import { IAsset, IFileRule, IMatchRule } from "./types";
import { fetch } from "lol/js/node/fs";
import minimatch from "minimatch";
import { clone } from "lol/js/object";
import { transform } from "./transform";

export class FilePipeline {

  /**
   * Pipeline type
   */
  readonly type = 'file'

  /**
   * Transformation rules
   */
  protected _rules: Record<string, IMatchRule> = {}

  constructor(private pid: string, private sid: string) {}

  private get pipeline() {
    return PipelineManager.get(this.pid)
  }

  /**
   * Add file pattern
   */
  add(pattern: string, transformRule?: IFileRule) {
    this._rules[pattern] = Object.assign({
      glob: pattern
    }, transformRule || {})

    return this
  }

  /**
   * Add file pattern to ignore
   */
  ignore(pattern: string) {
    this._rules[pattern] = {
      glob: pattern,
      ignore: true
    }
    return this
  }

  /**
   * Clone the pipeline
   */
  clone(file: FilePipeline) {
    file._rules = clone(this._rules)
    return file
  }

  /**
   * Collect a list of files matching patterns, then apply transformation rules
   */
  fetch() {
    if (!this.pipeline) return
    const pipeline = this.pipeline
    this._fetch().forEach(asset => {
      const rule = asset.rule as IMatchRule
      const transformed = transform(pipeline, asset, [rule])
      pipeline.manifest.addAsset(transformed)
    })
  }

  protected _fetch() {
    if (!this.pipeline) return []
    const pipeline = this.pipeline
    const source = pipeline.source.get(this.sid)
    if (!source) return []

    const globs: [string, IMatchRule][] = []
    const ignores: [string, IMatchRule][] = []

    for (const entry of Object.entries(this._rules)) {
      if (entry[1].ignore) {
        ignores.push(entry)
      } else {
        const glob = source.fullpath.join(entry[0]).os()
        globs.push([glob, entry[1]])
      }
    }

    let assets: IAsset[] = []
    const fetcher = this._fetcher()

    for (const [pattern, rule] of globs) {
      fetcher([pattern], []).forEach(file => {
        const input = source.fullpath.relative(file)
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
        })
      })
    }

    assets = assets.filter(asset => {
      for (const [pattern] of ignores) {
        if (minimatch(asset.input, pattern)) return false
      }
      return true
    })

    return assets
  }

  private _fetcher() {
    return function (globs: string[], ignores: string[]) {
      try {
        return fetch(globs, ignores)
      } catch (e) { }
      return []
    }
  }

}