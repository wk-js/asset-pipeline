import { join, relative } from "path";
import { EditFileCallback } from './utils/fs';
import { Tree } from "./tree";
import { Manager } from "./manager";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { Renderer } from "./renderer";
import { throws } from "assert";
import { Resolver as FileResolver } from "./file-resolver";

export interface AlternativeOutputs {
  condition: string,
  outputs: any[]
}

export interface Rules {
  ignore?:    boolean,
  files?:     string[],
  cache?:     boolean,
  keep_path?: boolean,
  rename?:    string,
  base_dir?:  string,
  template?:  object|boolean,
  edit?:      EditFileCallback,
  resolve?: (output: string, file: string, rules: AssetItemRules) => string,
  data?: any
}

export interface AssetItemRules extends Rules {
  glob: string
}

export interface AssetItem {
  load_path: string,
  input:  string,
  output: string,
  cache:  string,
  data?:  any,
}

export class AssetPipeline {

  load_path: string|null = null
  load_paths = new FileResolver()

  dst_path:  string = './public'
  root_path: string = process.cwd()

  cacheable: boolean = false
  cache_type: string = 'hash'

  prefix:     string          = ''
  asset_key:  string | number = 'no_key'
  asset_host: string | null   = null

  force_resolve: boolean = false
  save_manifest: boolean = true
  verbose: boolean = false

  data: any = {}

  tree     = new Tree( this )
  manager  = new Manager( this )
  manifest = new Manifest( this )
  renderer = new Renderer( this )

  file      = new FilePipeline( this )
  directory = new DirectoryPipeline( this )

  get absolute_dst_path() {
    return join(this.root_path, this.dst_path)
  }

  fromDstPath(path:string) {
    return join(this.absolute_dst_path, path)
  }

  getPath( path:string, fromPath?:string ) {
    return this.tree.getPath( path, fromPath )
  }

  getUrl( path:string, fromPath?:string ) {
    return this.tree.getUrl( path, fromPath )
  }

  resolve(force?:boolean) {
    force = force ? force : this.force_resolve

    this.load_paths.root_path = this.root_path
    if (this.load_path) this.load_paths.add( this.load_path )

    if (force || !this.manifest.fileExists()) {
      this.log( '[AssetPipeline] Fetch directories' )
      this.directory.fetch()
      this.tree.update()

      this.log( '[AssetPipeline] Fetch files' )
      this.file.fetch()
      this.tree.update()

      this.log( '[AssetPipeline] Clean resolved paths' )
      this.tree.clean_resolved()

      this.log( '[AssetPipeline] Update manifest' )
      return this.manifest.updateFile()
    } else {
      this.log( '[AssetPipeline] Read manifest' )
      return this.manifest.readFile()
    }

  }

  async render() {
    await this.renderer.render()
    return this.renderer.edit()
  }

  addEntry(input:string, output:string, parameters:Rules = {}) {
    parameters = Object.assign({
      rename: output,
      keep_path: false
    }, parameters)
    this.file.add( input, parameters )
  }

  addFile(glob:string, parameters?:Rules) {
    this.file.add( glob, parameters )
  }

  addDirectory(glob:string, parameters?:Rules) {
    this.directory.add( glob, parameters )
  }

  ignoreFile(glob:string) {
    this.file.ignore( glob )
  }

  ignoreDirectory(glob:string) {
    this.directory.ignore( glob )
  }

  getFileRules( file:string ) {
    return this.file.getRules( file )
  }

  getDirectoryRules( directory:string ) {
    return this.directory.getRules( directory )
  }

  log(...args:any[]) {
    if (this.verbose) console.log(...args)
  }

}