import { AssetItemRules } from "./asset-pipeline";
import { dirname } from "path";
import { fetch } from "./utils/fs";
import { unique } from "lol/utils/array";
import minimatch from "minimatch";
import { fetchDirs } from "./utils";
import { FilePipeline } from "./file-pipeline";

export class DirectoryPipeline extends FilePipeline {

  type: string = 'directory'

  fetch() {
    const globs = this.rules.map((item) => {
      return this.pipeline.fromLoadPath( item.glob )
    })

    unique(fetchDirs( globs ))

    .map((input) =>{
      input = this.pipeline.relativeToLoadPath( input )

      this.manifest.assets[input] = {
        input:  input,
        output: input,
        cache:  input
      }

      this.resolve( input )

      return this.manifest.assets[input]
    })

    .forEach((item) => {
      const subdirs = fetch( this.pipeline.fromLoadPath(item.input) + '/**/*' ).map((input:string) => {
        input = dirname( input )
        input = this.pipeline.relativeToLoadPath( input )

        this.manifest.assets[input] = {
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