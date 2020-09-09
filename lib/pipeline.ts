import { Manifest } from "./manifest";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { Cache } from "./cache";
import { guid } from "lol/js/string/guid";
import { normalize, cleanup, PathBuilder, URLBuilder } from "./path";
import * as Path from "path";
import { IResolvePathOptions, IPathObject } from "./types";

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
    PipelineManager.set(this.uuid, this)
  }

  clone(key: string) {
    const p = new Pipeline(key)
    this.cache.clone(p.cache)
    this.source.clone(p.source)
    this.manifest.clone(p.manifest)
    return p
  }

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
      return this.manifest.save()
    } else {
      this.log('Read manifest')
      return this.manifest.read()
    }
  }

  copy() {
    return this.source.copy()
  }

  log(...args: any[]) {
    if (this.verbose) console.log('[asset-pipeline]', ...args)
  }

  /**
   * Looking for source from a path by checking base directory
   */
  getSource(inputPath: string) {
    const sources = this.source.all()
    const source_paths = sources.map(p => {
      if (Path.isAbsolute(inputPath)) {
        return p.fullpath.web()
      }
      return p.path.web()
    })

    inputPath = normalize(inputPath, "web")
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
   * Looking for a source and
   */
  getAsset(path: string) {
    // Build relative path
    let relative = new PathBuilder(path)
    if (Path.isAbsolute(path)) {
      relative = this.cwd.relative(path)
    }

    // Clean paths
    const result: IPathObject = {
      relative: relative.web(),
    }

    // Looking for source
    const source = this.getSource(result.relative)

    // Build key and clean paths
    if (source) {
      result.source = source.path.web()
      result.key = source.path.relative(result.relative).web()
      result.full = source.fullpath.join(result.key).web()
    }

    return result
  }

  getPath(path: string, options?: Partial<IResolvePathOptions>) {
    if (!path) throw new Error("[asset-pipeline] path cannot be empty")
    const tree = this.resolver

    const opts = Object.assign({
      from: ".",
      cleanup: false,
    }, options || {}) as IResolvePathOptions

    // Cleanup path and get the output path
    path = tree.resolve(path)

    // Cleanup from path and get the output tree
    const fromTree = tree.getTree(opts.from)

    // Get output relative to from
    const output = this.output.with(fromTree.path)
      .relative(this.output.with(path).os())

    if (opts.cleanup) {
      return cleanup(output.web())
    }

    return output.web()
  }

  getUrl(path: string, options?: Partial<IResolvePathOptions>) {
    path = this.getPath(path, options)

    const url = this.host.join(path)
    try {
      return url.toURL().href
    } catch (e) { }
    return this.host.join(path).toString()
  }

  getAssetFromOutput(output: string) {
    if (!this.manifest) return
    const assets = this.manifest.export()
    for (let i = 0; i < assets.length; i++) {
      const item = assets[i];

      if (item.output == output || item.cache == output) {
        return item
      }
    }
  }

}