import minimatch from 'minimatch';
import { AssetPipeline, AssetItemRules } from '../asset-pipeline';
import { FilePipeline } from '../file-pipeline';
import { MergeTool } from './merge-tool';
import { exists } from '../utils/fs';

export class AssetPipelineShared {

  pipelines:AssetPipeline[] = []

  rules = {
    file: [] as AssetItemRules[],
    directory: [] as AssetItemRules[]
  }

  assets:any = {}
  data:any   = {}

  update() {
    this.data   = MergeTool.fetch_data  .apply(null, this.pipelines)
    this.assets = MergeTool.fetch_assets.apply(null, this.pipelines)
    this.rules  = MergeTool.fetch_rules .apply(null, this.pipelines)
  }

  fromLoadPath(path:string) {
    for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
      result = this.pipelines[i].fromLoadPath(path)
      if (exists(result)) return result
    }

    return path
  }

  fromDstPath(path:string) {
    for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
      result = this.pipelines[i].fromDstPath(path)
      if (exists(result)) return result
    }

    return path
  }

  relativeToLoadPath(path:string) {
    for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
      result = this.pipelines[i].relativeToLoadPath(path)
      if (exists(result)) return result
    } 

    return path
  }

  getPath(path:string) {
    for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
      result = this.pipelines[i].fromDstPath(this.pipelines[i].getPath(path))
      if (exists(result)) return result
    }

    return path
  }

  getFileRules( file:string ) {
    let rules = {}

    for (let i = 0, ilen = this.rules.file.length, item, relativeGlob; i < ilen; i++) {
      item = this.rules.file[i]

      if (file === item.glob || minimatch(file, item.glob)) {
        rules = Object.assign(rules, item)
      }
    }

    return rules
  }

  getDirectoryRules( dir:string ) {
    let rules: AssetItemRules = { glob: dir, cache: false }

    for (let i = 0, ilen = this.rules.directory.length, item, relativeGlob; i < ilen; i++) {
      item = this.rules.directory[i]

      if (dir === item.glob || minimatch(dir, item.glob)) {
        rules = Object.assign(rules, item)
      }
    }

    return rules
  }

}