import { Pipeline } from "./pipeline"
import { writeFile, isFile, readFile, remove } from "lol/js/node/fs";
import { IAsset, IManifest, IOutput } from "./types";
import { cleanPath } from "./utils/path";
import { clone } from "lol/js/object";

export class Manifest {

  private _file: IManifest = {
    key: 'no_key',
    date: new Date,
    sources: [],
    output: './public',
    root: process.cwd(),
    assets: {} as { [key: string]: IAsset }
  }

  read = false
  save = true

  constructor(private pipeline: Pipeline) { }

  clone(manifest: Manifest) {
    manifest.read = this.read
    manifest.save = this.save
  }

  get manifest_path() {
    return `tmp/manifest-${this.pipeline.cache.key}.json`
  }

  fileExists() {
    return this.save && isFile(this.manifest_path)
  }

  async create_file() {
    this._file.key = this.pipeline.cache.key
    this._file.date = new Date
    this._file.sources = this.pipeline.source.all()
    this._file.output = this.pipeline.resolve.output()
    this._file.root = this.pipeline.resolve.root()

    if (this.save) {
      await writeFile(JSON.stringify(this._file, null, 2), this.manifest_path)
    }
  }

  update_file() {
    return this.create_file()
  }

  async read_file() {
    if (isFile(this.manifest_path)) {
      const content = await readFile(this.manifest_path)
      this._file = JSON.parse(content.toString('utf-8'))
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
    return this._file.assets[input]
  }

  has(input: string) {
    input = cleanPath(input)
    input = input.split(/\#|\?/)[0]
    return !!this._file.assets[input]
  }

  set(asset: IAsset) {
    this._file.assets[asset.input] = asset
  }

  all(tag?: string) {
    const assets = Object.keys(this._file.assets).map((key) => this._file.assets[key])
    if (typeof tag == 'string') return assets.filter((asset) => asset.tag == tag)
    return assets
  }

  all_by_key(tag?: string) {
    const assets: Record<string, IAsset> = {}
    this.all(tag).forEach((asset) => {
      assets[asset.input] = asset
    })
    return assets
  }

  all_outputs(tag?: string) {
    return this.all(tag).map((asset) => {
      const input = asset.input
      return {
        input,
        output: {
          path: this.pipeline.resolve.path(input),
          url: this.pipeline.resolve.url(input),
        }
      } as IOutput
    })
  }

  all_outputs_by_key(tag?: string) {
    const outputs: Record<string, IOutput> = {}

    this.all_outputs(tag).forEach((output) => {
      outputs[output.input] = output
    })

    return outputs
  }

}