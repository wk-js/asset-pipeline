import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { FileSystem } from "./file-system";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { Source } from "./source";
import { Cache } from "./cache";

export class Pipeline {

  verbose: boolean = false

  cache = new Cache()
  source = new Source(this)
  directory = new DirectoryPipeline()
  file = new FilePipeline()
  manifest = new Manifest(this)
  resolve = new Resolver(this)
  tree = new Tree(this)
  fs = new FileSystem(this)

  constructor(key: string) {
    this.cache.key = key
  }

  clone(key: string) {
    const p = new Pipeline(key)
    this.cache.clone(p.cache)
    this.source.clone(p.source)
    this.directory.clone(p.directory)
    this.file.clone(p.file)
    this.manifest.clone(p.manifest)
    this.resolve.clone(p.resolve)
    this.fs.clone(p.fs)
    return p
  }

  fetch(force?: boolean) {
    force = force ? force : !this.manifest.read

    if (force || !this.manifest.fileExists()) {
      this.log('[AssetPipeline] Fetch directories')
      this.directory.fetch(this)
      this.tree.update()

      this.log('[AssetPipeline] Fetch files')
      this.file.fetch(this)
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

  log(...args: any[]) {
    if (this.verbose) console.log(...args)
  }

}