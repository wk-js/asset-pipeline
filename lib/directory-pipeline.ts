import Path from "path";
import { fetch } from "./utils/fs";
import { FilePipeline } from "./file-pipeline";
import { IAsset, IDirectoryRule } from "./types";
import { expose } from "lol/utils/object";
import minimatch from "minimatch";
import { Pipeline } from "./pipeline";

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

  fetch() {
    this._fetch()
      .map((asset) => {
        this.resolve(asset)
        return asset
      })

      .forEach((item) => {
        const glob = this.pipeline.source.source_with(item.load_path, item.input, true) + '/**/*'

        // Handle files
        fetch(glob).map((input: string) => {
          input = this.pipeline.resolve.relative(item.load_path, input)

          const pathObject = Path.parse(input)
          pathObject.dir = this.pipeline.resolve.path(pathObject.dir)
          const output = Path.format(pathObject)

          const rule = this.findRule(item.input) as IDirectoryRule
          const asset: IAsset = {
            load_path: item.load_path,
            input: input,
            output: output,
            cache: output
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