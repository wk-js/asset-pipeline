import { AssetPipeline, AssetItem } from "./asset-pipeline";
import { writeFile, isFile, readFile, remove } from "./utils/fs";
import { promiseResolved } from "./utils/promise";
import { clone } from "lol/utils/object";

const DEFAULT_PROMISE = promiseResolved(false)

export interface ManifestFile {
  asset_key: string | number;
  date: Date;
  load_path: string;
  dst_path: string;
  assets: Record<string, AssetItem>
}

export class Manifest {

  manifest:ManifestFile = {
    asset_key: this.pipeline.asset_key,
    date: new Date,
    load_path: this.pipeline.load_path,
    dst_path: this.pipeline.dst_path,
    assets: {} as { [key:string]: AssetItem }
  }

  constructor(public pipeline: AssetPipeline) {}

  get manifest_path() {
    return `tmp/manifest-${this.pipeline.asset_key}.json`
  }

  fileExists() {
    return this.pipeline.save_manifest && isFile(this.manifest_path)
  }

  createFile() {
    this.manifest.asset_key = this.pipeline.asset_key
    this.manifest.date      = new Date
    this.manifest.load_path = this.pipeline.load_path
    this.manifest.dst_path  = this.pipeline.dst_path

    if (this.pipeline.save_manifest) {
      return writeFile( JSON.stringify(this.manifest, null, 2), this.manifest_path )
      .then(() => true)
    }

    return DEFAULT_PROMISE
  }

  updateFile() {
    return this.createFile()
  }

  readFile() {
    if (isFile(this.manifest_path)) {
      return readFile( this.manifest_path ).then((content) => {
        this.manifest = JSON.parse( content.toString('utf-8') )
        return true
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

  getUsedAssets() {
    const manifest: ManifestFile = clone(this.manifest)
    manifest.assets = {}

    Object.keys(this.manifest.assets).forEach((path) => {
      if (this.pipeline.tree.isUsed(path)) {
        manifest.assets[path] = this.manifest.assets[path]
      }
    })

    return manifest
  }

}