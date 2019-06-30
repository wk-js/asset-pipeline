import { Pipeline } from "./pipeline"
import { writeFile, isFile, readFile, remove } from "./utils/fs";
import { IAsset, IManifest } from "./types";
import { expose } from "lol/utils/object";

export class Manifest {

  file: IManifest = {
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
    this.file.asset_key = this.hash_key
    this.file.date = new Date
    this.file.load_path = this.load_paths.getPaths()
    this.file.dst_path = this.pipeline.dst_path

    if (this.save) {
      await writeFile(JSON.stringify(this.file, null, 2), this.manifest_path)
    }
  }

  updateFile() {
    return this.createFile()
  }

  async readFile() {
    if (isFile(this.manifest_path)) {
      const content = await readFile(this.manifest_path)
      this.file = JSON.parse(content.toString('utf-8'))
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