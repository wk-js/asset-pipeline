import Path from "path";
import { Pipeline, PipelineManager } from "./pipeline";
import { normalize } from "./path";

export interface TreeInterface {
  path: string,
  files: string[]
  subdirectories: {
    [key: string]: TreeInterface
  }
}

export class Tree {

  tree: TreeInterface = {
    path: '.',
    files: [],
    subdirectories: {}
  }

  constructor(private pid: string) { }

  get pipeline() {
    return PipelineManager.get(this.pid)
  }

  get manifest() {
    return this.pipeline?.manifest
  }

  get cache() {
    return this.pipeline?.cache
  }

  get resolver() {
    return this.pipeline?.resolve
  }

  build(path: string) {
    if (!this.cache || !this.manifest) return path
    const manifest = this.manifest
    const cache = this.cache

    path = normalize(path, "web")
    const extra = path.match(/\#|\?/)
    let suffix = ''

    if (extra) {
      suffix = extra[0] + path.split(extra[0])[1]
      path = path.split(extra[0])[0]
    }

    let output = path
    const asset = manifest.get(path)

    if (asset) {
      output = cache.enabled ? asset.cache : asset.output
    }

    output = normalize(output, "web")
    output = output + suffix

    return output
  }

  update() {
    if (!this.resolver || !this.manifest) return
    const manifest = this.manifest
    const resolver = this.resolver

    const tree = {
      path: '.',
      files: [],
      subdirectories: {}
    } as TreeInterface

    const keys = manifest.export("asset").map((asset) => {
      return this.build(asset.input)
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
          path: normalize(path, "web"),
          files: [],
          subdirectories: {}
        }
        currDir = currDir.subdirectories[dir]
      })

      if (resolver.output().with(keys[i]).ext().length > 0) {
        currDir.files.push(file)
      } else {
        currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} }
      }
    }

    this.tree = tree
  }

  resolve(path: string) {
    const dirs = normalize(path, "web").split('/')
    let tree = this.tree

    for (let i = 0, ilen = dirs.length; i < ilen; i++) {
      if (tree.subdirectories[dirs[i]]) {
        tree = tree.subdirectories[dirs[i]]
      }
    }

    return tree
  }

  view() {
    if (!this.resolver) return ""
    const resolver = this.resolver

    function ptree(tree: TreeInterface, tab: string) {
      let print = ''

      Object.keys(tree.subdirectories).forEach(function (dir) {
        print += tab + dir + '\n'
        print += ptree(tree.subdirectories[dir], tab + "  ") + '\n'
      })

      print += tab + tree.files.join(`\n${tab}`)

      return print
    }

    let output = Path.relative(process.cwd(), resolver.output().raw())
    output = normalize(output, "web")
    return output + '\n' + ptree(this.tree, "  ").replace(/\n\s+\n/g, '\n')
  }

}