import { join } from "path";
import {  PipelineManager } from "./pipeline";
import { cleanup, normalize, PathBuilder } from "./path";
import { IResolvePathOptions } from "./types";

export interface TreeInterface {
  name: string,
  path: string,
  files: string[]
  subdirectories: {
    [key: string]: TreeInterface
  }
}

export class Resolver {

  root: TreeInterface = {
    name: ".",
    path: ".",
    files: [],
    subdirectories: {}
  }

  constructor(private pid: string) { }

  private get pipeline() {
    return PipelineManager.get(this.pid)
  }

  /**
   * Look for outputPath
   */
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
    const asset = manifest.getAsset(inputPath)

    if (asset) {
      output = cache.enabled ? asset.cache : asset.output
    }

    output = normalize(output, "web")
    output = output + suffix

    return output
  }

  /**
   * Refresh output tree
   */
  refreshTree() {
    if (!this.pipeline) return
    const { cache, manifest } = this.pipeline

    const tree = {
      name: ".",
      path: ".",
      files: [],
      subdirectories: {}
    } as TreeInterface

    const assets = manifest.export("asset")
    let currDir = tree
    let path = tree.path

    for (const asset of assets) {
      const output = cache.enabled ? asset.output : asset.cache
      const dirs = output.split("/").map(dir => dir.length === 0 ? "." : dir)
      const file = asset.type === "file" ? dirs.pop() : undefined

      currDir = tree
      path = tree.path
      for (const dir of dirs) {
        if (currDir.name === dir) continue
        path = normalize(join(path, dir), "unix")
        if (!currDir.subdirectories[dir]) {
          currDir.subdirectories[dir] = {
            name: dir,
            path,
            files: [],
            subdirectories: {}
          }
        }
        currDir = currDir.subdirectories[dir]
      }

      if (file) {
        currDir.files.push(file)
      }
    }

    this.root = tree
  }

  /**
   * Convert inputPath to outputPath and return its directory tree
   */
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

  /**
   * Get path
   */
  getPath(inputPath: string, options?: Partial<IResolvePathOptions>) {
    if (!inputPath) throw new Error("[asset-pipeline] path cannot be empty")
    if (!this.pipeline) return inputPath
    const outputDir = this.pipeline.output
    const host = this.pipeline.host

    const opts = Object.assign({
      from: ".",
      cleanup: false,
    }, options || {}) as IResolvePathOptions

    // Cleanup path and get the output path
    const outputPath = this.resolve(inputPath)

    // Cleanup from path and get the output tree
    const fromTree = this.getTree(opts.from)

    // Get output relative to from
    let output = outputDir.with(fromTree.path)
      .relative(outputDir.with(outputPath).os())

    if (opts.cleanup) {
      output = new PathBuilder(cleanup(output.os()))
    }

    return host.pathname.join(output.os()).web()
  }

  /**
   * Get url
   */
  getUrl(inputPath: string, options?: Partial<IResolvePathOptions>) {
    if (!this.pipeline) return inputPath
    inputPath = this.getPath(inputPath, options)
    return this.pipeline.host.join(inputPath).toString()
  }

  /**
   * Preview output tree
   */
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