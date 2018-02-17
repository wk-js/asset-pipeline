import { AssetPipeline, AssetItem } from "./asset-pipeline";
import { writeFile, isFile, readFile, remove } from "./utils/fs";
import when from 'when';

const DEFAULT_PROMISE = when(true)

export class Manifest {

  manifest = {
    ASSET_KEY: this.pipeline.asset_key,
    DATE: new Date,
    LOAD_PATH: this.pipeline.load_path,
    DIST_PATH: this.pipeline.dst_path,
    ASSETS: {} as { [key:string]: AssetItem }
  }

  constructor(public pipeline: AssetPipeline) {}

  get manifest_path() {
    return `tmp/manifest-${this.pipeline.asset_key}.json`
  }

  fileExists() {
    return this.pipeline.save_manifest && isFile(this.manifest_path)
  }

  createFile() {
    this.manifest.ASSET_KEY = this.pipeline.asset_key
    this.manifest.DATE      = new Date
    this.manifest.LOAD_PATH = this.pipeline.load_path
    this.manifest.DIST_PATH = this.pipeline.dst_path

    if (this.pipeline.save_manifest) {
      return writeFile( JSON.stringify(this.manifest, null, 2), this.manifest_path )
    }

    return DEFAULT_PROMISE
  }

  updateFile() {
    return this.createFile()
  }

  readFile() {
    if (isFile(this.manifest_path)) {
      return readFile( this.manifest_path ).then((content:Buffer) => {
        this.manifest = JSON.parse( content.toString('utf-8') )
      })
    }

    if (this.pipeline.save_manifest) {
      return this.createFile()
    }

    return DEFAULT_PROMISE
  }

  deleteFile() {
    if (isFile(this.manifest_path)) {
      return remove(this.manifest_path).then(() => true)
    }

    return DEFAULT_PROMISE 
  }

}