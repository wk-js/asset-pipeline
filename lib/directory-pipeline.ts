import Path from "path";
import { fetch, fetchDirs } from "lol/js/node/fs";
import { FilePipeline } from "./file-pipeline";
import { IAsset, IDirectoryRule, IPipeline } from "./types";
import minimatch from "minimatch";
import { Pipeline } from "./pipeline";
import { cleanPath } from "./utils/path";
import { Transform } from "./transform";
import { unique } from "lol/js/array";

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
  clone(directory: DirectoryPipeline) {
    directory._shadows = this._shadows.slice(0)
    this.rules.clone(directory.rules)
    return directory
  }

  fetch(pipeline: Pipeline) {
    this._fetch(pipeline)
      .map((asset) => {
        this.rules.resolve(pipeline, asset)
        return asset
      })

      .forEach((item) => {
        const glob = pipeline.source.with(item.source, item.input, true) + '/**/*'

        // Handle files
        fetch(glob).map((input: string) => {
          input = pipeline.resolve.relative(item.source, input)

          const pathObject = Path.parse(input)
          pathObject.dir = pipeline.resolve.path(pathObject.dir)
          const output = Path.format(pathObject)

          const rule = this.rules.matchingRule(item.input) as IDirectoryRule
          const asset: IAsset = {
            source: item.source,
            input: cleanPath(input),
            output: cleanPath(output),
            cache: cleanPath(output)
          }

          // Handle rules for files
          if (
            !(pipeline.manifest.has(asset.input) && (pipeline.manifest.get(asset.input) as IAsset).resolved)
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
          pipeline.manifest.set(asset)
        })
      })
  }

  protected _fetch(pipeline: Pipeline) {
    // @ts-ignore
    return FilePipeline.prototype._fetch.call(this, pipeline)
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