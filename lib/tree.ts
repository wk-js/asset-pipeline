import { isFile } from "./utils/fs";
import { AssetPipeline, AssetItem, AlternativeOutputs } from "./asset-pipeline";
import { normalize, dirname, extname, relative, join } from "path";
import { URL } from "url";
import { ManifestFile } from "./manifest";

/**
 * Clean path
 */
function _cleanPath( input:string ) {
  const i = input.split('/')
  i.push('')
  input = normalize(i.join('/')).slice(0, -1)
  return input
}

/**
 *
 */
function _toUnixPath(pth:string) {
  pth = pth.replace(/\\/g, '/')

  const double = /\/\//
  while (pth.match(double)) {
    pth = pth.replace(double, '/') // node on windows doesn't replace doubles
  }

  return pth
}


export interface TreeInterface {
  path: string,
  files: string[]
  subdirectories: {
    [key:string]: TreeInterface
  }
}

export class Tree {

  _tree: TreeInterface = {
    path: '.',
    files: [],
    subdirectories: {}
  }

  constructor(public pipeline:AssetPipeline) {}

  get manifest() {
    return this.pipeline.manifest.manifest
  }

  update() {
    const pipeline = this.pipeline

    const  tree = {
      path: '.',
      files: [],
      subdirectories: {}
    } as TreeInterface

    const keys = Object.keys(this.manifest.assets).map((key) => {
      return this.buildPath( key )
    })
    let currDir = tree
    let path    = tree.path

    for (let i = 0, ilen = keys.length; i < ilen; i++) {
      const dirs = keys[i].split('/')
      const file = dirs.pop() as string

      currDir = tree
      path = tree.path
      dirs.forEach(function(dir:string) {
        path += '/' + dir
        currDir.subdirectories[dir] = currDir.subdirectories[dir] || {
          path: normalize(path),
          files: [],
          subdirectories: {}
        }
        currDir = currDir.subdirectories[dir]
      })

      if (extname(pipeline.fromDstPath(keys[i])).length > 0) {
        currDir.files.push( file )
      } else {
        currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} }
      }
    }

    this._tree = tree
  }

  resolve(path:string) {
    const dirs = normalize(path).split('/')
    let tree = this._tree

    for (let i = 0, ilen = dirs.length; i < ilen; i++) {
      if (tree.subdirectories[dirs[i]]) {
        tree = tree.subdirectories[dirs[i]]
      }
    }

    return tree
  }


  buildPath( path:string ) {
    path = normalize( path )
    const extra = path.match(/\#|\?/)
    let suffix  = ''

    if (extra) {
      suffix = extra[0] + path.split(extra[0])[1]
      path = path.split(extra[0])[0]
    }

    let output = path

    if (this.manifest.assets[output]) {
      const item    = this.manifest.assets[output]
      output = this.pipeline.cacheable ? item.cache : item.output

      if ("alternatives" in item && typeof item.alternatives) {
        const alts = item.alternatives as AlternativeOutputs

        alts.outputs.forEach((alt) => {
          var asset_data = this.pipeline.data
          var data       = alt.data

          if (eval(alts.condition)) {
            output = this.pipeline.cacheable ? alt.cache : alt.output
          }
        })
      }
    }

    output = _cleanPath( this.pipeline.prefix + output )
    output = process.platform === 'win32' ? _toUnixPath( output ) : output
    output = output + suffix

    return output
  }

  /**
   * @param {string} path - Path required
   * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
   */
  getPath(path:string, fromPath?:string) {
    if (!fromPath) fromPath = this._tree.path

    fromPath = this.buildPath( fromPath )
    path     = this.buildPath( path )

    const fromTree = this.resolve( fromPath )

    const output = relative(
      join(this.pipeline.absolute_dst_path, fromTree.path),
      join(this.pipeline.absolute_dst_path, path),
    )

    return output
  }

  /**
   * @param {string} path - Path required
   * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
   */
  getUrl( path:string, fromPath?:string ) {
    path = this.getPath( path, fromPath )

    if (this.pipeline.asset_host) {
      const url = new URL( path, this.pipeline.asset_host )
      path      = url.href
    }

    return path
  }

  view() {
    function ptree(tree:TreeInterface, tab:string) {
      let print = ''

      Object.keys(tree.subdirectories).forEach(function(dir) {
        print += tab + dir + '\n'
        print += ptree( tree.subdirectories[dir], tab + "  " ) + '\n'
      })

      print += tab + tree.files.join(`\n${tab}`)

      return print
    }

    return ptree( this._tree, "" ).replace(/\n\s+\n/g, '\n')
  }

}