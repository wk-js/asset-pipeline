import { PipelineManager } from "./pipeline"
import { writeFileSync, isFile, removeSync } from "lol/js/node/fs";
import { IAsset, IManifest, IOutput, IAssetWithSource } from "./types";
import { isValidURL, normalize } from "./path";
import { readFileSync, } from "fs";
import { omit } from "lol/js/object";
import { isAbsolute } from "path";

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
    return `tmp/manifest-${this.pipeline.cache.saltKey}.json`
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

    this._file.key = this.pipeline.cache.saltKey
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
  getAsset(inputPath: string): IAsset | undefined {
    inputPath = normalize(inputPath, "web")

    if (isAbsolute(inputPath)) {
      const relative = this.pipeline!.cwd.relative(inputPath)

      const source = this.findSource(relative.web())
      if (!source) return undefined

      inputPath = source.path.relative(relative.os()).web()
    }

    inputPath = inputPath.split(/\#|\?/)[0]
    return this._file.assets[inputPath]
  }

  /**
   * Get AssetWithSource object from inputPath
   */
  getAssetWithSource(inputPath: string): IAssetWithSource | undefined {
    if (!this.pipeline) return
    const asset = this.getAsset(inputPath)
    if (!asset) return
    const source = this.pipeline.source.get(asset.source.uuid)
    if (!source) return
    return {
      source,
      ...omit<Omit<IAsset, "source">>(asset, "source")
    }
  }

  /**
   * Check asset exists
   */
  hasAsset(inputPath: string) {
    return !!this.getAsset(inputPath)
  }

  /**
   * Add asset
   */
  addAsset(asset: IAsset) {
    this._file.assets[asset.input] = asset
    if (this.saveAtChange) {
      this.saveFile()
    }
  }

  /**
   * Remove asset
   */
  removeAsset(input: string | IAsset) {
    let asset: IAsset | undefined
    if (typeof input === "string") {
      asset = this.getAsset(input)
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
  clearAssets() {
    this._file.assets = {}
    if (this.saveAtChange) {
      this.saveFile()
    }
  }

  /**
   * Get Source object
   */
  findSource(inputPath: string) {
    if (!this.pipeline) return

    inputPath = normalize(inputPath, "web")
    const asset = this.getAsset(inputPath)

    if (asset) {
      const source = this.pipeline.source.get(asset.source.uuid)
      if (source) return source
    }

    const sources = this.pipeline.source.all()
    const source_paths = sources.map(p => {
      if (isAbsolute(inputPath)) {
        return p.fullpath.web()
      }
      return p.path.web()
    })

    const dir = []
    const parts = inputPath.split("/")

    for (const part of parts) {
      dir.push(part)
      const dir_path = normalize(dir.join("/"), "web")

      const index = source_paths.indexOf(dir_path)
      if (index > -1) {
        const key = sources[index].path.relative(inputPath).web()
        if (this.hasAsset(key)) return sources[index]
      }
    }
  }

  /**
   * Get IAsset object from output
   */
  findAssetFromOutput(outputPath: string) {
    if (!this.pipeline) return
    const pipeline = this.pipeline

    outputPath = normalize(outputPath, "web")

    // Remove URL host
    if (isValidURL(outputPath)) {
      const u = new URL(outputPath)
      outputPath = u.pathname
    }

    // Remove absolute path name
    if (isAbsolute(outputPath)) {
      outputPath = pipeline.host.pathname.relative(outputPath).web()
    }

    const assets = this.export()
    for (let i = 0; i < assets.length; i++) {
      const item = assets[i]

      if (item.output == outputPath) {
        return item
      }
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
                source: source.get(a.source.uuid),
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
              type: asset.type,
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