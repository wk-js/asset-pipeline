import { Manifest } from "./manifest";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { Cache } from "./cache";
import { guid } from "lol/js/string/guid";
import { normalize, cleanup, PathBuilder, URLBuilder } from "./path";
import * as Path from "path";
import { IResolvePathOptions } from "./types";

export const PipelineManager = new Map<string, Pipeline>()

export class Pipeline {

  uuid = guid()
  verbose: boolean = false
  output = new PathBuilder("public")
  host = new URLBuilder("/")
  cwd = new PathBuilder(process.cwd())

  cache = new Cache()
  source = new SourceManager(this.uuid)
  manifest = new Manifest(this.uuid)
  resolver = new Resolver(this.uuid)

  constructor(key: string) {
    this.cache.key = key
    this.source.add("__shadow__")
    PipelineManager.set(this.uuid, this)
  }

  /**
   * Clone pipeline
   */
  clone(key: string) {
    const p = new Pipeline(key)
    this.cache.clone(p.cache)
    this.source.clone(p.source)
    this.manifest.clone(p.manifest)
    return p
  }

  /**
   * Fetch directories, files, update tree and update manifest
   */
  fetch(force?: boolean) {
    force = force ? force : !this.manifest.readOnDisk

    if (force || !this.manifest.fileExists()) {
      this.log('Clear manifest')
      this.manifest.clear()

      this.log('Fetch directories')
      this.source.fetch("directory")
      this.resolver.refreshTree()

      this.log('Fetch files')
      this.source.fetch("file")
      this.resolver.refreshTree()

      this.log('Save manifest')
      return this.manifest.saveFile()
    } else {
      this.log('Read manifest')
      return this.manifest.readFile()
    }
  }

  /**
   * Perform copy/move/symlink
   */
  copy() {
    return this.source.copy()
  }

  /**
   * Logger
   */
  log(...args: any[]) {
    if (this.verbose) console.log('[asset-pipeline]', ...args)
  }

  /**
   * Get Source object
   */
  getSource(inputPath: string) {
    inputPath = normalize(inputPath, "web")

    const asset = this.manifest.get(inputPath)

    if (asset) {
      const source = this.source.get(asset.source.uuid)
      if (source) return source
    }

    const sources = this.source.all()
    const source_paths = sources.map(p => {
      if (Path.isAbsolute(inputPath)) {
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
        if (this.manifest.has(key)) return sources[index]
      }
    }
  }

  /**
   * Get IAsset object
   */
  getAsset(inputPath: string) {
    let relative = new PathBuilder(inputPath)
    if (Path.isAbsolute(inputPath)) {
      relative = this.cwd.relative(inputPath)

      const source = this.getSource(relative.web())
      if (!source) return undefined

      inputPath = source.path.relative(relative.os()).web()
    }

    return this.manifest.get(inputPath)
  }

  /**
   * Get path
   */
  getPath(inputPath: string, options?: Partial<IResolvePathOptions>) {
    if (!inputPath) throw new Error("[asset-pipeline] path cannot be empty")
    const tree = this.resolver

    const opts = Object.assign({
      from: ".",
      cleanup: false,
    }, options || {}) as IResolvePathOptions

    // Cleanup path and get the output path
    inputPath = tree.resolve(inputPath)

    // Cleanup from path and get the output tree
    const fromTree = tree.getTree(opts.from)

    // Get output relative to from
    const output = this.output.with(fromTree.path)
      .relative(this.output.with(inputPath).os())

    if (opts.cleanup) {
      return cleanup(output.web())
    }

    return output.web()
  }

  /**
   * Get url
   */
  getUrl(inputPath: string, options?: Partial<IResolvePathOptions>) {
    inputPath = this.getPath(inputPath, options)

    const url = this.host.join(inputPath)
    try {
      return url.toURL().href
    } catch (e) { }
    return this.host.join(inputPath).toString()
  }

  /**
   * Get IAsset object from output
   */
  getAssetFromOutput(outputPath: string) {
    if (!this.manifest) return
    const assets = this.manifest.export()
    for (let i = 0; i < assets.length; i++) {
      const item = assets[i];

      if (item.output == outputPath || item.cache == outputPath) {
        return item
      }
    }
  }

}