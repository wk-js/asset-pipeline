import { Manifest } from "./manifest";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { Cache } from "./cache";
import { guid } from "lol/js/string/guid";

export const PipelineManager = new Map<string, Pipeline>()

export class Pipeline {

  uuid = guid()
  verbose: boolean = false

  cache = new Cache()
  resolve = new Resolver(this.uuid)
  source = new SourceManager(this.uuid)
  manifest = new Manifest(this.uuid)
  tree = new Tree(this.uuid)

  constructor(key: string) {
    this.cache.key = key
    PipelineManager.set(this.uuid, this)
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
    force = force ? force : !this.manifest.readOnDisk

    if (force || !this.manifest.fileExists()) {
      this.log('Clear manifest')
      this.manifest.clear()

      this.log('Fetch directories')
      this.source.fetch("directory")
      this.tree.update()

      this.log('Fetch files')
      this.source.fetch("file")
      this.tree.update()

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

}