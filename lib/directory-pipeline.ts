import Path from "path";
import { fetch } from "lol/js/node/fs";
import { FilePipeline } from "./file-pipeline";
import { IAsset, IDirectoryRule } from "./types";
import minimatch from "minimatch";
import { Pipeline } from "./pipeline";
import { cleanPath } from "./utils/path";

export class DirectoryPipeline extends FilePipeline {

  constructor(pipeline: Pipeline) {
    super(pipeline)
    this.type = 'directory'
  }

  add(glob: string, parameters: IDirectoryRule = {}) {
    return super.add(glob, parameters)
  }

  addEntry(input: string, output: string, parameters: IDirectoryRule = {}) {
    return super.addEntry(input, output, parameters)
  }

  clone(dir: DirectoryPipeline) {
    for (let i = 0; i < this.rules.length; i++) {
      const glob = this.rules[i];
      dir.rules.push( glob )
    }
    return dir
  }

  fetch() {
    this._fetch()
      .map((asset) => {
        this.resolve(asset)
        return asset
      })

      .forEach((item) => {
        const glob = this.pipeline.source.with(item.source, item.input, true) + '/**/*'

        // Handle files
        fetch(glob).map((input: string) => {
          input = this.pipeline.resolve.relative(item.source, input)

          const pathObject = Path.parse(input)
          pathObject.dir = this.pipeline.resolve.path(pathObject.dir)
          const output = Path.format(pathObject)

          const rule = this.findRule(item.input) as IDirectoryRule
          const asset: IAsset = {
            source: item.source,
            input: cleanPath(input),
            output: cleanPath(output),
            cache: cleanPath(output)
          }

          // Handle rules for files
          if (
            !(this.pipeline.manifest.has(asset.input) && (this.pipeline.manifest.get(asset.input) as IAsset).resolved)
            && rule.file_rules
            && rule.file_rules.length > 0) {

            for (let i = 0; i < rule.file_rules.length; i++) {
              const r = rule.file_rules[i];
              if (!r.ignore && minimatch(asset.input, r.glob || asset.input)) {
                asset.rule = r
                this.resolve(asset)
              }
            }

            return;
          }

          asset.resolved = true
          this.pipeline.manifest.set(asset)
        })
      })
  }

}