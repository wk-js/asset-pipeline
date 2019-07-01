import { Pipeline } from "./pipeline"
import { writeFile, isFile, readFile, remove } from "./utils/fs";
import { IAsset, IManifest } from "./types";
import { expose } from "lol/utils/object";
import { cleanPath } from "./utils/path";

export class Manifest {

  read_file: IManifest = {
    asset_key: 'no_key',
    date: new Date,
    load_path: [],
    dst_path: './public',
    assets: {} as { [key: string]: IAsset }
  }

  read = false
  save = true

  constructor(private pipeline: Pipeline) { }

  get manifest_path() {
    return `tmp/manifest-${this.pipeline.cache.key}.json`
  }

  fileExists() {
    return this.save && isFile(this.manifest_path)
  }

  async create_file() {
    this.read_file.asset_key = this.pipeline.cache.key
    this.read_file.date = new Date
    this.read_file.load_path = this.pipeline.source.all()
    this.read_file.dst_path = this.pipeline.resolve.output

    if (this.save) {
      await writeFile(JSON.stringify(this.read_file, null, 2), this.manifest_path)
    }
  }

  update_file() {
    return this.create_file()
  }

  async readFile() {
    if (isFile(this.manifest_path)) {
      const content = await readFile(this.manifest_path)
      this.read_file = JSON.parse(content.toString('utf-8'))
    }

    if (this.save) {
      await this.create_file()
    }
  }

  async delete_file() {
    if (isFile(this.manifest_path)) {
      await remove(this.manifest_path)
    }
  }

  get(input: string): IAsset | null {
    input = cleanPath(input)
    input = input.split(/\#|\?/)[0]
    return this.read_file.assets[input]
  }

  has(input: string) {
    input = cleanPath(input)
    input = input.split(/\#|\?/)[0]
    return !!this.read_file.assets[input]
  }

  set(asset: IAsset) {
    this.read_file.assets[asset.input] = asset
  }

  all() {
    return Object.keys(this.read_file.assets).map((key) => this.read_file.assets[key])
  }

}