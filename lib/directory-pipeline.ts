import { AssetPipeline, GlobItem, AssetItem } from "./asset-pipeline";
import { normalize, dirname, basename, parse, format, join, relative } from "path";
import { readdir } from "fs";
import { fetch } from "./utils/fs";
import { unique } from "lol/utils/array";
import minimatch from "minimatch";
import { hashCache } from "./cache";
import { fetchDirs } from "./utils";
import { FilePipeline } from "./file-pipeline";

export class DirectoryPipeline extends FilePipeline {

  fetch() {
    const globs = this._globs.map((item) => {
      return this.pipeline.fromLoadPath( item.glob )
    })

    unique(fetchDirs( globs ))

    .map((input) =>{
      input = this.pipeline.relativeToLoadPath( input )

      this.manifest.ASSETS[input] = {
        input:  input,
        output: input,
        cache:  input
      }

      this.resolve( input )

      return this.manifest.ASSETS[input]
    })

    .forEach((item) => {
      const subdirs = fetch( this.pipeline.fromLoadPath(item.input) + '/**/*' ).map((input:string) => {
        input = dirname( input )
        input = this.pipeline.relativeToLoadPath( input )

        this.manifest.ASSETS[input] = {
          input:  input,
          output: input,
          cache:  input
        }

        this.resolve( input )
      })

    })

  }

  getRules(dir:string) {
    let rules: GlobItem = { glob: dir, cache: false }

    for (let i = 0, ilen = this._globs.length, item, relativeGlob; i < ilen; i++) {
      item = this._globs[i]

      // if (dir === item.glob) {
      //   rules = item
      //   break;
      // } else if (minimatch(dir, item.glob)) {
      //   rules = Object.assign(rules, item)
      // }

      if (dir === item.glob || minimatch(dir, item.glob)) {
        rules = Object.assign(rules, item)
      }
    }

    return rules
  }

}