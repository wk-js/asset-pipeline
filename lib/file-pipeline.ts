import { Pipeline } from "./pipeline"
import { IAsset, IFileRule, IPipeline } from "./types";
import { Transform } from "./transform";
import { fetch } from "lol/js/node/fs";
import { merge } from "lol/js/object";

export class FilePipeline implements IPipeline {

  /**
   * Pipeline type
   */
  readonly type = 'file'

  /**
   * Transformation rules
   */
  rules = new Transform()

  protected _shadows: IAsset[] = []
  protected _globToAdd: string[] = []
  protected _globToIgnore: string[] = []

  constructor(private _source: string) {}

  /**
   * Add file pattern
   */
  add(pattern: string, transformRule?: IFileRule) {
    this._globToAdd.push(pattern)
    if (transformRule) this.rules.add(pattern, transformRule)
    return this
  }

  /**
   * Add file pattern to ignore
   */
  ignore(pattern: string) {
    this._globToIgnore.push(pattern)
    return this
  }

  /**
   * Add non-existing file to the manifest. Rules are applied.
   */
  shadow(file: string, transformRule?: IFileRule) {
    this._shadows.push({
      source: '__shadow__',
      input: file,
      output: file,
      cache: file,
      tag: 'default',
      resolved: false
    })
    if (transformRule) this.rules.add(file, transformRule)
    return this
  }

  /**
   * Clone the pipeline
   */
  clone(file: FilePipeline) {
    file._shadows = this._shadows.slice(0)
    this.rules.clone(file.rules)
    return file
  }

  /**
   * Collect a list of files matching patterns, then apply transformation rules
   */
  fetch(pipeline: Pipeline) {
    this._fetch(pipeline).forEach((asset) => {
      this.rules.resolve(pipeline, asset)
    })
    return this
  }

  protected _fetch(pipeline: Pipeline) {
    const globs: string[] = []
    const ignores: string[] = []
    const source = pipeline.source.get(this._source)
    if (!source) return []

    this._globToAdd.forEach(pattern => {
      const glob = source.join(pipeline.resolve, pattern, true)
      globs.push(glob)
    })

    this._globToIgnore.forEach(pattern => {
      const ignore = source.join(pipeline.resolve, pattern, true)
      ignores.push(ignore)
    })

    const fetcher = this._fetcher()

    const assets = fetcher(globs, ignores)
      .map((file) => {
        const input = pipeline.resolve.relative(this._source, file)
        return {
          source: pipeline.resolve.relative(pipeline.resolve.root(), this._source),
          input: input,
          output: input,
          cache: input,
          resolved: false
        } as IAsset
      })
    .filter((asset) => asset != null)

    return this._shadows.concat(assets as IAsset[])
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