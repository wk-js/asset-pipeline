import Path from "path";
import { Pipeline, PipelineManager } from "./pipeline";
import { IPathObject, IResolvePathOptions } from "./types";
import { createWrapper, normalize, cleanup, PathWrapper } from "./path";

export class Resolver {

  private _output!: PathWrapper
  public host: string = ''

  constructor(private pid: string) {
    this.output("public")
  }

  get pipeline() {
    return PipelineManager.get(this.pid)
  }

  get source() {
    return this.pipeline?.source
  }

  get manifest() {
    return this.pipeline?.manifest
  }

  get tree() {
    return this.pipeline?.tree
  }

  clone(resolve: Resolver) {
    resolve.host = this.host
    resolve.output('public')
  }

  output(path?: string) {
    if (path) {
      if (Path.isAbsolute(path)) {
        this._output = createWrapper(path)
      } else {
        this._output = createWrapper(Path.join(process.cwd(), path))
      }
    }
    return this._output
  }

  getPath(path: string, options?: Partial<IResolvePathOptions>) {
    if (!path) throw new Error("[asset-pipeline][Resolver] path cannot be empty")
    if (!this.tree) return path
    const tree = this.tree

    const opts = Object.assign({
      from: tree.tree.path,
      cleanup: false,
    }, options || {}) as IResolvePathOptions

    opts.from = tree.build(opts.from)
    path = tree.build(path)

    const fromTree = tree.resolve(opts.from)

    const output = this._output.with(fromTree.path)
      .relative(this._output.with(path).raw())

    if (opts.cleanup) {
      return cleanup(output.toWeb())
    }

    return output.toWeb()
  }

  getUrl(path: string, options?: Partial<IResolvePathOptions>) {
    path = this.getPath(path, options)

    if (this.host) {
      try {
        const url = new URL(path, this.host)
        return url.href
      } catch (e) {
        return this.host + path
      }
    }

    return path
  }

  /**
   * Looking for source from a path by checking base directory
   */
  findSource(path: string) {
    if (!this.source || !this.manifest) return
    const source = this.source
    const manifest = this.manifest

    const sources = source.all()
    const source_paths = sources.map(p => {
      if (Path.isAbsolute(path)) {
        return p.fullpath.toWeb()
      }
      return p.path.toWeb()
    })

    path = normalize(path, "web")
    const dir = []
    const parts = path.split("/")

    for (const part of parts) {
      dir.push( part )
      const dir_path = normalize(dir.join("/"), "web")

      const index = source_paths.indexOf(dir_path)
      if (index > -1) {
        const key = sources[index].path.relative(path).toWeb()
        if (manifest.has(key)) return sources[index]
      }
    }
  }

  /**
   * Looking for a source and
   */
  parse(path: string) {
    // Build relative path
    let relative = createWrapper(path)
    if (Path.isAbsolute(path)) {
      relative = createWrapper(Path.relative(process.cwd(), path))
    }

    // Clean paths
    const result: IPathObject = {
      relative: relative.toWeb(),
    }

    // Looking for source
    const source = this.findSource(result.relative)

    // Build key and clean paths
    if (source) {
      result.source = source.path.toWeb()
      result.key = source.path.relative(result.relative).toWeb()
      result.full = source.fullpath.join(result.key).toWeb()
    }

    return result
  }

  getInputFromOutput(output: string, absolute = false) {
    if (!this.source) return

    const asset = this.getAssetFromOutput(output)
    if (!asset) return

    const source = this.source.get(asset.source.uuid)
    if (!source) return

    if (absolute) {
      return source.fullpath.join(asset.input).toWeb()
    }

    return source.path.join(asset.input).toWeb()
  }

  getAssetFromOutput(output: string) {
    if (!this.manifest) return
    const assets = this.manifest.export()
    for (let i = 0; i < assets.length; i++) {
      const item = assets[i];

      if (item.output == output || item.cache == output) {
        return item
      }
    }
  }

}