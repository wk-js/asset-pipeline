import * as Path from "path";
import { fetch, fetchDirs } from "lol/js/node/fs";
import { FilePipeline } from "./file-pipeline";
import { IAsset, IDirectoryRule, IPipeline } from "./types";
import minimatch from "minimatch";
import { PipelineManager } from "./pipeline";
import { Transform } from "./transform";
import { unique } from "lol/js/array";
import { normalize } from "./path";

export class DirectoryPipeline implements IPipeline {

  /**
   * Pipeline type
   */
  readonly type = 'directory'

  /**
   * Transformation rules
   */
  rules = new Transform()

  protected _shadows: IAsset[] = []
  protected _globToAdd: string[] = []
  protected _globToIgnore: string[] = []

  constructor(private pid: string, private sid: string) { }

  get pipeline() {
    return PipelineManager.get(this.pid)
  }

  /**
   * Append file pattern
   */
  add(pattern: string, transformRule?: IDirectoryRule) {
    this._globToAdd.push(pattern)
    if (transformRule) this.rules.add(pattern, transformRule)
  }

  /**
   * Append file pattern to ignore
   */
  ignore(pattern: string) {
    this._globToIgnore.push(pattern)
  }

  /**
   * Append non-existing file to the manifest. Rules are applied.
   */
  shadow(file: string) {
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
  }

  /**
   * Clone the pipeline
   */
  clone(directory: DirectoryPipeline) {
    directory._shadows = this._shadows.slice(0)
    this.rules.clone(directory.rules)
    return directory
  }

  fetch() {
    if (!this.pipeline) return
    const pipeline = this.pipeline
    const source = pipeline.source.get(this.sid)
    if (!source) return
    const { manifest } = this.pipeline

    this._fetch()
      .map((asset) => {
        this.rules.resolve(pipeline, asset)
        return asset
      })

      .forEach((item) => {
        const glob = source.fullpath.join(item.input, '**/*').os()

        // Handle files
        fetch(glob).map((file: string) => {
          const input = source.fullpath.relative(file)

          const pathObject = Path.parse(input.os())
          pathObject.dir = pipeline.getPath(pathObject.dir)
          const output = Path.format(pathObject)

          const rule = this.rules.matchingRule(item.input) as IDirectoryRule
          const asset: IAsset = {
            source: item.source,
            input: input.web(),
            output: normalize(output, "web"),
            cache: normalize(output, "web"),
            tag: typeof rule.tag == 'string' ? rule.tag : 'default'
          }

          // Handle rules for files
          if (
            !(manifest.has(asset.input) && (manifest.get(asset.input) as IAsset).resolved)
            && rule.file_rules
            && rule.file_rules.length > 0) {

            for (let i = 0; i < rule.file_rules.length; i++) {
              const r = rule.file_rules[i];
              if (!r.ignore && minimatch(asset.input, r.glob || asset.input)) {
                asset.rule = r
                this.rules.resolve(pipeline, asset)
              }
            }

            return;
          }

          asset.resolved = true
          asset.rule = rule
          manifest.add(asset)
        })
      })
  }

  protected _fetch() {
    return FilePipeline.prototype["_fetch"].call(this)
  }

  protected _fetcher() {
    return function (globs: string[], ignores: string[]) {
      try {
        return unique(fetchDirs(globs, ignores))
      } catch (e) { }
      return []
    }
  }

}