import Path from "path";
import {  PipelineManager } from "./pipeline";
import { normalize } from "./path";

export interface TreeInterface {
  path: string,
  files: string[]
  subdirectories: {
    [key: string]: TreeInterface
  }
}

export class Resolver {

  root: TreeInterface = {
    path: '.',
    files: [],
    subdirectories: {}
  }

  constructor(private pid: string) { }

  get pipeline() {
    return PipelineManager.get(this.pid)
  }

  resolve(inputPath: string) {
    if (!this.pipeline) return inputPath
    const { cache, manifest } = this.pipeline

    inputPath = normalize(inputPath, "web")
    const extra = inputPath.match(/\#|\?/)
    let suffix = ''

    if (extra) {
      suffix = extra[0] + inputPath.split(extra[0])[1]
      inputPath = inputPath.split(extra[0])[0]
    }

    let output = inputPath
    const asset = manifest.get(inputPath)

    if (asset) {
      output = cache.enabled ? asset.cache : asset.output
    }

    output = normalize(output, "web")
    output = output + suffix

    return output
  }

  refreshTree() {
    if (!this.pipeline) return
    const { cache, manifest } = this.pipeline

    const tree = {
      path: '.',
      files: [],
      subdirectories: {}
    } as TreeInterface

    const keys = manifest.export("asset").map((asset) => {
      return cache.enabled ? asset.cache : asset.output
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

      if (this.pipeline.output.with(keys[i]).ext().length > 0) {
        currDir.files.push(file)
      } else {
        currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} }
      }
    }

    this.root = tree
  }

  getTree(inputPath: string) {
    const outputPath = this.resolve(inputPath)

    const dirs = normalize(outputPath, "web").split('/')
    let tree = this.root

    for (let i = 0, ilen = dirs.length; i < ilen; i++) {
      if (tree.subdirectories[dirs[i]]) {
        tree = tree.subdirectories[dirs[i]]
      }
    }

    return tree
  }

  view() {
    if (!this.pipeline) return ""

    function ptree(tree: TreeInterface, tab: string) {
      let print = ''

      Object.keys(tree.subdirectories).forEach(function (dir) {
        print += tab + dir + '\n'
        print += ptree(tree.subdirectories[dir], tab + "  ") + '\n'
      })

      print += tab + tree.files.join(`\n${tab}`)

      return print
    }

    const output = this.pipeline.cwd.relative(this.pipeline.output.os()).web()
    return output + '\n' + ptree(this.root, "  ").replace(/\n\s+\n/g, '\n')
  }

}