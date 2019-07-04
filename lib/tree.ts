import { cleanPath, toUnixPath } from "./utils/path";
import Path from "path";
import { Resolver } from "./resolver";
import { Pipeline } from "./pipeline";

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

  constructor(private pipeline: Pipeline) { }

  build(path: string) {
    path = cleanPath(path)
    const extra = path.match(/\#|\?/)
    let suffix = ''

    if (extra) {
      suffix = extra[0] + path.split(extra[0])[1]
      path = path.split(extra[0])[0]
    }

    let output = path
    const asset = this.pipeline.resolve.asset(path)

    if (asset) {
      output = this.pipeline.cache.enabled ? asset.cache : asset.output
    }

    output = cleanPath(output)
    output = process.platform === 'win32' ? toUnixPath(output) : output
    output = output + suffix

    return output
  }

  update() {
    const tree = {
      path: '.',
      files: [],
      subdirectories: {}
    } as TreeInterface

    const keys = this.pipeline.manifest.all().map((asset) => {
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
          path: cleanPath(path),
          files: [],
          subdirectories: {}
        }
        currDir = currDir.subdirectories[dir]
      })

      if (Path.extname(this.pipeline.resolve.output_with(keys[i])).length > 0) {
        currDir.files.push(file)
      } else {
        currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} }
      }
    }

    this.tree = tree
  }

  resolve(path: string) {
    const dirs = cleanPath(path).split('/')
    let tree = this.tree

    for (let i = 0, ilen = dirs.length; i < ilen; i++) {
      if (tree.subdirectories[dirs[i]]) {
        tree = tree.subdirectories[dirs[i]]
      }
    }

    return tree
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

    return this.pipeline.resolve.output() + '\n' + ptree(this.tree, "  ").replace(/\n\s+\n/g, '\n')
  }

}