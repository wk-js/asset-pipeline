import { PipelineManager } from "./pipeline"
import { writeFileSync, isFile, removeSync } from "lol/js/node/fs";
import { IAsset, IManifest, IOutput } from "./types";
import { normalize } from "./path";
import { readFileSync, } from "fs";

export class Manifest {

  private _file: IManifest = {
    key: 'no_key',
    date: new Date,
    sources: [],
    output: './public',
    assets: {} as { [key: string]: IAsset }
  }

  readOnDisk = false
  saveOnDisk = true
  saveAtChange = false

  constructor(private pid: string) { }

  get pipeline() {
    return PipelineManager.get(this.pid)
  }

  clone(manifest: Manifest) {
    manifest
    manifest.readOnDisk = this.readOnDisk
    manifest.saveOnDisk = this.saveOnDisk
    manifest.saveAtChange = this.saveAtChange
  }

  get manifest_path() {
    if (!this.pipeline) return `tmp/manifest.json`
    return `tmp/manifest-${this.pipeline.cache.key}.json`
  }

  fileExists() {
    return this.saveOnDisk && isFile(this.manifest_path)
  }

  save() {
    if (!this.pipeline) return

    this._file.key = this.pipeline.cache.key
    this._file.date = new Date
    this._file.sources = this.pipeline.source.all().map(s => s.path.toWeb())
    this._file.output = this.pipeline.resolve.output().toWeb()

    if (this.saveOnDisk) {
      writeFileSync(JSON.stringify(this._file, null, 2), this.manifest_path)
    }
  }

  read() {
    if (isFile(this.manifest_path)) {
      const content = readFileSync(this.manifest_path)
      this._file = JSON.parse(content.toString('utf-8'))
    }

    if (this.saveOnDisk) {
      this.save()
    }
  }

  deleteOnDisk() {
    if (isFile(this.manifest_path)) {
      removeSync(this.manifest_path)
    }
  }

  get(input: string): IAsset | undefined {
    input = normalize(input, "web")
    input = input.split(/\#|\?/)[0]
    return this._file.assets[input]
  }

  has(input: string) {
    return !!this.get(input)
  }

  add(asset: IAsset) {
    this._file.assets[asset.input] = asset
    if (this.saveAtChange) {
      this.save()
    }
  }

  remove(input: string | IAsset) {
    let asset: IAsset | undefined
    if (typeof input === "string") {
      asset = this.get(input)
    } else {
      asset = input
    }

    if (asset) {
      delete this._file.assets[asset.input]

      if (this.saveAtChange) {
        this.save()
      }
    }
  }

  clear() {
    this._file.assets = {}
    if (this.saveAtChange) {
      this.save()
    }
  }

  export(type?: "asset", tag?: string): IAsset[];
  export(type: "asset_key", tag?: string): Record<string, IAsset>;
  export(type: "output", tag?: string): IOutput[];
  export(type: "output_key", tag?: string): Record<string, IOutput>;
  export(type: "asset" | "asset_key" | "output" | "output_key" = "asset", tag?: string): any {
    switch (type) {
      case "asset":
        {
          const assets = Object
            .keys(this._file.assets)
            .map((key) => this._file.assets[key]) as IAsset[]
          if (typeof tag == 'string') return assets.filter(a => a.tag == tag)
          return assets
        }
      case "asset_key":
        {
          const assets: Record<string, IAsset> = {}
          this.export("asset", tag).forEach(a => assets[a.input] = a)
          return assets
        }
      case "output":
        {
          if (!this.pipeline) return []
          const pipeline = this.pipeline
          const assets = this.export("asset", tag)
          return assets.map((asset) => {
            const input = asset.input
            return {
              input,
              output: {
                path: pipeline.resolve.getPath(input),
                url: pipeline.resolve.getUrl(input),
              }
            } as IOutput
          })
        }
      case "output_key":
        {
          const outputs: Record<string, IOutput> = {}
          this.export("output", tag).forEach(o => outputs[o.input] = o)
          return outputs
        }
    }
  }

}