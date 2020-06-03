import { Manifest } from "./manifest";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { SourceMap } from "./source";
import { Cache } from "./cache";

export class Pipeline {

  verbose: boolean = false

  cache = new Cache()
  source = new SourceMap()
  manifest = new Manifest(this)
  resolve = new Resolver(this)
  tree = new Tree(this)

  constructor(key: string) {
    this.cache.key = key
  }

  clone(key: string) {
    const p = new Pipeline(key)
    this.cache.clone(p.cache)
    this.source.clone(p.source)
    this.manifest.clone(p.manifest)
    this.resolve.clone(p.resolve)
    return p
  }

  fetch(force?: boolean) {
    force = force ? force : !this.manifest.read

    if (force || !this.manifest.fileExists()) {
      this.log('[AssetPipeline] Clear manifest')
      this.manifest.clear()

      this.log('[AssetPipeline] Fetch directories')
      this.source.fetch(this, "directory")
      this.tree.update()

      this.log('[AssetPipeline] Fetch files')
      this.source.fetch(this, "file")
      this.tree.update()

      this.log('[AssetPipeline] Clean resolved paths')
      this.resolve.clean_used()

      this.log('[AssetPipeline] Update manifest')
      return this.manifest.update_file()
    } else {
      this.log('[AssetPipeline] Read manifest')
      return this.manifest.read_file()
    }
  }

  copy() {
    return this.source.copy(this)
  }

  log(...args: any[]) {
    if (this.verbose) console.log('[asset-pipeline]', ...args)
  }

}