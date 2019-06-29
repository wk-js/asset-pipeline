import { Pipeline } from "./pipeline"
import { normalize, extname, relative, join, isAbsolute } from "path";
import { URL } from "url";
import { IAsset } from "./types";
import { clean_path, to_unix_path, remove_search } from "./utils/path";

export interface TreeInterface {
  path: string,
  files: string[]
  subdirectories: {
    [key: string]: TreeInterface
  }
}

export class PathResolver {

  _tree: TreeInterface = {
    path: '.',
    files: [],
    subdirectories: {}
  }

  _resolved_paths: string[] = []

  constructor(private pipeline: Pipeline) { }

  get manifest() {
    return this.pipeline.manifest.manifest
  }

  get cacheable() {
    return this.pipeline.cacheable
  }

  get host() {
    return this.pipeline.host
  }

  update() {
    const pipeline = this.pipeline

    const tree = {
      path: '.',
      files: [],
      subdirectories: {}
    } as TreeInterface

    const keys = Object.keys(this.manifest.assets).map((key) => {
      return this.buildPath(key)
    })
    let currDir = tree
    let path = tree.path

    for (let i = 0, ilen = keys.length; i < ilen; i++) {
      const dirs = keys[i].split('/')
      const file = dirs.pop() as string

      currDir = tree
      path = tree.path
      dirs.forEach(function (dir: string) {
        path += '/' + dir
        currDir.subdirectories[dir] = currDir.subdirectories[dir] || {
          path: normalize(path),
          files: [],
          subdirectories: {}
        }
        currDir = currDir.subdirectories[dir]
      })

      if (extname(pipeline.fromDstPath(keys[i])).length > 0) {
        currDir.files.push(file)
      } else {
        currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} }
      }
    }

    this._tree = tree
  }

  resolve(path: string) {
    const dirs = normalize(path).split('/')
    let tree = this._tree

    for (let i = 0, ilen = dirs.length; i < ilen; i++) {
      if (tree.subdirectories[dirs[i]]) {
        tree = tree.subdirectories[dirs[i]]
      }
    }

    return tree
  }

  getAsset(path: string ) {
    path = normalize(path)
    path = path.split(/\#|\?/)[0]
    return this.manifest.assets[path]
  }

  buildPath(path: string) {
    path = normalize(path)
    const extra = path.match(/\#|\?/)
    let suffix = ''

    if (extra) {
      suffix = extra[0] + path.split(extra[0])[1]
      path = path.split(extra[0])[0]
    }

    let output = path
    const asset = this.getAsset(path)

    if (asset) {
      output = this.cacheable ? asset.cache : asset.output
    }

    output = clean_path(output)
    output = process.platform === 'win32' ? to_unix_path(output) : output
    output = output + suffix

    return output
  }

  /**
   * @param {string} path - Path required
   * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
   */
  getPath(path: string, fromPath?: string) {
    if (!fromPath) fromPath = this._tree.path

    fromPath = this.buildPath(fromPath)
    path = this.buildPath(path)

    const fromTree = this.resolve(fromPath)

    const output = relative(
      join(this.pipeline.absolute_dst_path, fromTree.path),
      join(this.pipeline.absolute_dst_path, path),
    )

    this._resolved(path)

    return output
  }

  /**
   * @param {string} path - Path required
   * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
   */
  getUrl(path: string, fromPath?: string) {
    path = this.getPath(path, fromPath)

    if (this.host) {
      const url = new URL(path, this.host)
      path = url.href
    }

    return path
  }

  getFilePath(path: string, fromPath?: string) {
    path = this.getPath(path, fromPath)
    return remove_search(path)
  }

  getFileUrl(path: string, fromPath?: string) {
    return this.getUrl(path, fromPath)
  }

  getSourceFilePath(path: string, fromPath?: string) {
    const asset = this.getAsset(path)

    if (asset) {
      if (fromPath) {
        if (isAbsolute(fromPath)) {
          path = this.pipeline.load_paths.from_load_path(asset.load_path, asset.input)
        }
        return relative(fromPath, path)
      } else {
        return join(asset.load_path, asset.input)
      }
    }

    return path
  }

  view() {
    function ptree(tree: TreeInterface, tab: string) {
      let print = ''

      Object.keys(tree.subdirectories).forEach(function (dir) {
        print += tab + dir + '\n'
        print += ptree(tree.subdirectories[dir], tab + "  ") + '\n'
      })

      print += tab + tree.files.join(`\n${tab}`)

      return print
    }

    return ptree(this._tree, "").replace(/\n\s+\n/g, '\n')
  }

  private _resolved(path: string) {
    if (this._resolved_paths.indexOf(path) == -1) {
      this._resolved_paths.push(path)
    }
  }

  is_resolved(path: string) {
    return this._resolved_paths.indexOf(path) > -1
  }

  get_resolved() {
    const assets: Record<string, IAsset> = {}

    Object.keys(this.manifest.assets).forEach((path) => {
      if (this.is_resolved(path)) {
        assets[path] = this.manifest.assets[path]
      }
    })

    return assets
  }

  clean_resolved() {
    this._resolved_paths = []
  }

}