import { createHash } from "crypto";
import { guid } from 'lol/utils/guid';
import { join, normalize, relative, basename, extname, dirname, parse, format } from "path";
import { fetch, isDirectory, isFile } from './utils/fs';
import minimatch from 'minimatch';
import { generateHash, hashCache, versionCache } from "./cache";
import { template2 } from "lol/utils/string";
import { URL } from "url";
import { deflat } from "lol/utils/object";
import { Tree } from "./tree";
import { Manager } from "./manager";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { Renderer } from "./renderer";

export interface AlternativeOutputs {
  condition: string,
  outputs: any[]
}

export interface GlobItem {
  glob:       string,
  ignore?:    boolean,
  files?:     string[],
  cache?:     boolean,
  keep_path?: boolean,
  rename?:    string,
  base_dir?:  string,
  template?:  object|boolean,
  edit?:      (value: Buffer | string) => Buffer | string,

  data?: any
  alternatives?: AlternativeOutputs
}

export interface AssetItem {
  input:  string,
  output: string,
  cache:  string,
  data?:  any,
  alternatives?: AlternativeOutputs
}

export class AssetPipeline {

  load_path: string = './app'
  dst_path:  string = './public'
  root_path: string = process.cwd()

  cacheable: boolean = false

  prefix:     string          = ''
  asset_key:  string | number = 'no_key'
  asset_host: string | null   = null

  force_resolve: boolean = false
  save_manifest: boolean = true

  data: any = {}

  tree     = new Tree( this )
  manager  = new Manager( this )
  manifest = new Manifest( this )
  renderer = new Renderer( this   )

  file      = new FilePipeline( this )
  directory = new DirectoryPipeline( this )

  get absolute_load_path() {
    return join(this.root_path, this.load_path)
  }

  get absolute_dst_path() {
    return join(this.root_path, this.dst_path)
  }

  fromLoadPath(path:string) {
    return join(this.absolute_load_path, path)
  }

  fromDstPath(path:string) {
    return join(this.absolute_dst_path, path)
  }

  relativeToLoadPath(path:string) {
    return relative(this.absolute_load_path, path)
  }

  getPath( path:string, fromPath?:string ) {
    return this.tree.getPath( path, fromPath )
  }

  getUrl( path:string, fromPath?:string ) {
    return this.tree.getUrl( path, fromPath )
  }

  resolve(force?:boolean) {
    force = this.force_resolve ? this.force_resolve : force

    if (force || !this.manifest.fileExists()) {
      console.log( '[AssetPipeline] Fetch directories' )
      this.directory.fetch()
      this.tree.update()

      console.log( '[AssetPipeline] Fetch files' )
      this.file.fetch()
      this.tree.update()

      console.log( '[AssetPipeline] Update manifest' )
      return this.manifest.updateFile()
    } else {
      console.log( '[AssetPipeline] Read manifest' )
      return this.manifest.readFile()
    }
  }

  render() {
    return this.renderer.render().then(() => {
      return this.renderer.edit()
    })
  }

  addEntry(input:string, output:string, parameters?:GlobItem) {
    parameters = Object.assign({
      glob: '',
      rename: output,
      keep_path: false
    }, parameters || {})
    this.file.add( input, parameters as GlobItem )
  }

  addFile(glob:string, parameters?:GlobItem) {
    this.file.add( glob, parameters )
  }

  addDirectory(glob:string, parameters?:GlobItem) {
    this.directory.add( glob, parameters )
  }

  ignoreFile(glob:string) {
    this.file.ignore( glob )
  }

  ignoreDirectory(glob:string) {
    this.directory.ignore( glob )
  }

}