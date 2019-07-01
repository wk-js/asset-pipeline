import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { FileSystem } from "./file-system";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { SourceManager } from "./source-manager";
import { Cache } from "./cache";

export class Pipeline {

  verbose: boolean = false

  cache = new Cache()
  source = new SourceManager(this)
  directory = new DirectoryPipeline(this)
  file = new FilePipeline(this)
  manifest = new Manifest(this)
  resolve = new Resolver(this)
  tree = new Tree(this)
  fs = new FileSystem(this)

  fetch(force?: boolean) {
    force = force ? force : !this.manifest.read

    if (force || !this.manifest.fileExists()) {
      this.log('[AssetPipeline] Fetch directories')
      this.directory.fetch()
      this.tree.update()

      this.log('[AssetPipeline] Fetch files')
      this.file.fetch()
      this.tree.update()

      this.log('[AssetPipeline] Clean resolved paths')
      this.resolve.clean_used()

      this.log('[AssetPipeline] Update manifest')
      return this.manifest.updateFile()
    } else {
      this.log('[AssetPipeline] Read manifest')
      return this.manifest.readFile()
    }
  }

  log(...args: any[]) {
    if (this.verbose) console.log(...args)
  }

}