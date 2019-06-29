import { join } from "path";
import { PathResolver } from "./path-resolver";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { FileMatcher } from "./file-matcher";
import { FileSystem } from "./file-system";

export class Pipeline {

  dst_path: string = './public'
  root_path: string = process.cwd()

  cacheable: boolean = false
  cache_type: string = 'hash'
  hash_key: string | number = 'no_key'
  host: string | null = null

  verbose: boolean = false

  load_paths = new FileMatcher(this)
  directory = new DirectoryPipeline(this)
  file = new FilePipeline(this)
  manifest = new Manifest(this)
  resolver = new PathResolver(this)

  fs = new FileSystem( this )

  get absolute_dst_path() {
    return join(this.root_path, this.dst_path)
  }

  fromDstPath(path: string) {
    return join(this.absolute_dst_path, path)
  }

  resolve(force?: boolean) {
    force = force ? force : !this.manifest.read

    if (force || !this.manifest.fileExists()) {
      this.log('[AssetPipeline] Fetch directories')
      this.directory.fetch()
      this.resolver.update()

      this.log('[AssetPipeline] Fetch files')
      this.file.fetch()
      this.resolver.update()

      this.log('[AssetPipeline] Clean resolved paths')
      this.resolver.clean_resolved()

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