import { PipelineManager } from "./pipeline"
import { IAsset, IFileRule, IPipeline } from "./types";
import { Transform } from "./transform";
import { fetch } from "lol/js/node/fs";

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

  constructor(private pid: string, private sid: string) {}

  private get pipeline() {
    return PipelineManager.get(this.pid)
  }

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
      source: {
        uuid: '__shadow__',
        path: '__shadow__',
      },
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
  fetch() {
    if (!this.pipeline) return
    const pipeline = this.pipeline
    this._fetch().forEach((asset) => {
      this.rules.transform(pipeline, asset)
    })
  }

  protected _fetch() {
    if (!this.pipeline) return []
    const pipeline = this.pipeline
    const source = pipeline.source.get(this.sid)
    if (!source) return []

    const globs: string[] = []
    const ignores: string[] = []

    this._globToAdd.forEach(pattern => {
      const glob = source.fullpath.join(pattern).os()
      globs.push(glob)
    })

    this._globToIgnore.forEach(pattern => {
      const ignore = source.fullpath.join(pattern).os()
      ignores.push(ignore)
    })

    const fetcher = this._fetcher()

    const assets = fetcher(globs, ignores)
      .map((file) => {
        const input = source.fullpath.relative(file)
        return {
          source: {
            uuid: source.uuid,
            path: source.path.web(),
          },
          input: input.web(),
          output: input.web(),
          cache: input.web(),
          resolved: false,
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