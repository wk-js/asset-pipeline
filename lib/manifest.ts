import { PipelineManager } from "./pipeline"
import { writeFileSync, isFile, removeSync } from "lol/js/node/fs";
import { IAsset, IManifest, IOutput, IAssetWithSource } from "./types";
import { normalize } from "./path";
import { readFileSync, } from "fs";
import { omit } from "lol/js/object";

export class Manifest {

  private _file: IManifest = {
    key: 'no_key',
    date: new Date,
    sources: [],
    output: './public',
    assets: {} as { [key: string]: IAsset }
  }

  // Read on disk (default: false)
  readOnDisk = false

  // Save on disk (default: true)
  saveOnDisk = true

  // Save on disk at each change (default: false)
  saveAtChange = false

  constructor(private pid: string) { }

  private get pipeline() {
    return PipelineManager.get(this.pid)
  }

  clone(manifest: Manifest) {
    manifest.readOnDisk = this.readOnDisk
    manifest.saveOnDisk = this.saveOnDisk
    manifest.saveAtChange = this.saveAtChange
  }

  get manifestPath() {
    if (!this.pipeline) return `tmp/manifest.json`
    return `tmp/manifest-${this.pipeline.cache.key}.json`
  }

  /**
   * Check if manifest file is created
   */
  fileExists() {
    return this.saveOnDisk && isFile(this.manifestPath)
  }

  /**
   * Save manifest file
   */
  saveFile() {
    if (!this.pipeline) return

    this._file.key = this.pipeline.cache.key
    this._file.date = new Date()
    this._file.sources = this.pipeline.source.all().map(s => s.path.web())
    this._file.output = this.pipeline.output.web()

    if (this.saveOnDisk) {
      writeFileSync(JSON.stringify(this._file, null, 2), this.manifestPath)
    }
  }

  /**
   * Read manifest file
   */
  readFile() {
    if (isFile(this.manifestPath)) {
      const content = readFileSync(this.manifestPath)
      this._file = JSON.parse(content.toString('utf-8'))
    }

    if (this.saveOnDisk) {
      this.saveFile()
    }
  }

  /**
   * Remove manifest file
   */
  removeFile() {
    if (isFile(this.manifestPath)) {
      removeSync(this.manifestPath)
    }
  }

  /**
   * Get Asset
   */
  get(input: string): IAsset | undefined {
    input = normalize(input, "web")
    input = input.split(/\#|\?/)[0]
    return this._file.assets[input]
  }

  /**
   * Get AssetWithSource object from inputPath
   */
  getWithSource(input: string): IAssetWithSource | undefined {
    if (!this.pipeline) return undefined
    const { source } = this.pipeline

    input = normalize(input, "web")
    input = input.split(/\#|\?/)[0]

    const asset = this._file.assets[input]
    if (!asset || !source.has(asset.source.uuid)) return undefined

    return {
      source: source.get(asset.source.uuid)!,
      ...omit<Omit<IAsset, "source">>(asset, "source")
    } as IAssetWithSource
  }

  /**
   * Check asset exists
   */
  has(input: string) {
    return !!this.get(input)
  }

  /**
   * Add asset
   */
  add(asset: IAsset) {
    this._file.assets[asset.input] = asset
    if (this.saveAtChange) {
      this.saveFile()
    }
  }

  /**
   * Remove asset
   */
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
        this.saveFile()
      }
    }
  }

  /**
   * Clear manifest
   */
  clear() {
    this._file.assets = {}
    if (this.saveAtChange) {
      this.saveFile()
    }
  }

  /**
   * Export a list of all the assets
   */
  export(exportType?: "asset", tag?: string): IAsset[];
  export(exportType: "asset_key", tag?: string): Record<string, IAsset>;
  export(exportType: "asset_source", tag?: string): IAssetWithSource[];
  export(exportType: "asset_source_key", tag?: string): Record<string, IAssetWithSource>;
  export(exportType: "output", tag?: string): IOutput[];
  export(exportType: "output_key", tag?: string): Record<string, IOutput>;
  export(exportType: "asset" | "asset_key" | "asset_source" | "asset_source_key" | "output" | "output_key" = "asset", tag?: string): any {
    switch (exportType) {
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
      case "asset_source":
        {
          if (!this.pipeline) return []
          const { source } = this.pipeline

          return this.export("asset", tag)
            .filter(a => source.has(a.source.uuid))
            .map(a => {
              return {
                source: source.get(a.source.uuid)!,
                ...omit<Omit<IAsset, "source">>(a, "source")
              } as IAssetWithSource
            })
        }
      case "asset_source_key":
        {
          const assets: Record<string, IAssetWithSource> = {}
          this.export("asset_source", tag).forEach(a => assets[a.input] = a)
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
                path: pipeline.getPath(input),
                url: pipeline.getUrl(input),
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