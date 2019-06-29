import { AssetItemRules } from "./asset-pipeline";
import { dirname } from "path";
import { fetch } from "./utils/fs";
import minimatch from "minimatch";
import { FilePipeline } from "./file-pipeline";

export class DirectoryPipeline extends FilePipeline {

  type: string = 'directory'

  fetch() {
    this.pipeline.load_paths
    .fetchDirs(this.rules)

    .map((asset) => {
      this.manifest.assets[asset.input] = asset
      this.resolve( asset.input )
      return asset
    })

    .forEach((item) => {
      const glob = this.pipeline.load_paths.from_load_path(item.load_path, item.input) + '/**/*'

      fetch( glob ).map((input:string) => {
        input = dirname( input )
        input = this.pipeline.load_paths.relative_to_load_path( item.load_path, input )

        this.manifest.assets[input] = {
          load_path: item.load_path,
          input:  input,
          output: input,
          cache:  input
        }

        this.resolve( input )
      })
    })

  }

  getRules(dir:string) {
    let rules: AssetItemRules = { glob: dir, cache: false }

    for (let i = 0, ilen = this.rules.length, item, relativeGlob; i < ilen; i++) {
      item = this.rules[i]

      // if (dir === item.glob) {
      //   rules = item
      //   break;
      // } else if (minimatch(dir, item.glob)) {
      //   rules = Object.assign(rules, item)
      // }

      if (dir === item.glob || minimatch(dir, item.glob)) {
        rules = Object.assign(rules, item)
      } else if (minimatch(dir, item.glob + '/**') && typeof item.rename === 'string') {
        rules = Object.assign(rules, Object.assign({}, item, {
          rename: rules.glob.replace(item.glob, item.rename)
        }))
      }
    }

    return rules
  }

}