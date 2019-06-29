import { Pipeline } from "./pipeline"
import { writeFile, isFile, readFile, remove } from "./utils/fs";
import { IAsset, IManifest } from "./types";
import { expose } from "lol/utils/object";

export class Manifest {

  manifest: IManifest = {
    asset_key: this.hash_key,
    date: new Date,
    load_path: [],
    dst_path: this.pipeline.dst_path,
    assets: {} as { [key: string]: IAsset }
  }

  read = false
  save = true

  constructor(private pipeline: Pipeline) { }

  get manifest_path() {
    return `tmp/manifest-${this.hash_key}.json`
  }

  get hash_key() {
    return this.pipeline.hash_key
  }

  get load_paths() {
    return this.pipeline.load_paths
  }

  fileExists() {
    return this.save && isFile(this.manifest_path)
  }

  async createFile() {
    this.manifest.asset_key = this.hash_key
    this.manifest.date = new Date
    this.manifest.load_path = this.load_paths.get_paths()
    this.manifest.dst_path = this.pipeline.dst_path

    if (this.save) {
      await writeFile(JSON.stringify(this.manifest, null, 2), this.manifest_path)
    }
  }

  updateFile() {
    return this.createFile()
  }

  async readFile() {
    if (isFile(this.manifest_path)) {
      const content = await readFile(this.manifest_path)
      this.manifest = JSON.parse(content.toString('utf-8'))
    }

    if (this.save) {
      await this.createFile()
    }
  }

  async deleteFile() {
    if (isFile(this.manifest_path)) {
      await remove(this.manifest_path)
    }
  }

}