import { Pipeline } from "./pipeline"
import { IAsset, IFileRule, IPipeline } from "./types";
import { Transform } from "./transform";
import { unique } from "lol/js/array";
import { fetchDirs, fetch } from "lol/js/node/fs";

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

  /**
   * Add file pattern
   */
  add(pattern: string, transformRule?: IFileRule) {
    this._globToAdd.push(pattern)
    if (transformRule) this.rules.add(pattern, transformRule)
  }

  /**
   * Add file pattern to ignore
   */
  ignore(pattern: string) {
    this._globToIgnore.push(pattern)
  }

  /**
   * Add non-existing file to the manifest. Rules are applied.
   */
  shadow(file: string) {
    this._shadows.push({
      source: '__shadow__',
      input: file,
      output: file,
      cache: file,
      resolved: false
    })
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
  }

  protected _fetch(pipeline: Pipeline) {
    const globs: string[] = []
    const ignores: string[] = []

    pipeline.source.all(true).forEach((source) => {
      this._globToAdd.forEach((pattern) => {
        globs.push(pipeline.source.with(source, pattern, true))
      })
      this._globToIgnore.forEach((pattern) => {
        ignores.push(pipeline.source.with(source, pattern, true))
      })
    })

    const fetcher = this._fetcher()

    const assets = fetcher(globs, ignores)
      .map((file) => {
        const source = pipeline.source.find_from_input(file, true)

        if (source) {
          const input = pipeline.resolve.relative(source, file)
          return {
            source: pipeline.resolve.relative(pipeline.resolve.root(), source),
            input: input,
            output: input,
            cache: input,
            resolved: false
          } as IAsset
        }

        return null
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