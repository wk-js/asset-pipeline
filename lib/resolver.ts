import { cleanPath, removeSearch } from "./utils/path";
import Path from "path";
import { Pipeline } from "./pipeline";
import { IPathObject } from "./types";

export class Resolver {

  private _output: string = 'public'
  private _used: string[] = []
  private _root: string = process.cwd()
  public host: string = ''

  constructor(private pipeline: Pipeline) { }

  clone(resolve: Resolver) {
    resolve.host = this.host
    resolve.root(this._root)
    resolve.output(this._output)
  }

  root(path?: string) {
    if (path) {
      if (!Path.isAbsolute(path)) throw new Error('Root must be absolute')
      this._root = cleanPath(path)
    }
    return this._root
  }

  root_with(path: string) {
    path = Path.join(this._root, cleanPath(path))
    return cleanPath(path)
  }

  output(path?: string) {
    if (path) this._output = cleanPath(path)
    return this._output
  }

  output_with(path: string, absolute = true) {
    path = cleanPath(path)
    if (absolute) {
      path = Path.join(this._root, this._output, path)
    } else {
      path = Path.join(this._output, path)
    }
    return cleanPath(path)
  }

  path(path: string, from: string = this.pipeline.tree.tree.path) {
    from = cleanPath(from)
    from = this.pipeline.tree.build(from)
    path = cleanPath(path)
    path = this.pipeline.tree.build(path)

    const fromTree = this.pipeline.tree.resolve(from)
    const output = this.relative(
      this.output_with(fromTree.path),
      this.output_with(path)
    )

    this.use(path)

    return output
  }

  url(path: string, from?: string) {
    path = this.path(path, from)

    const host = this.host ? this.host : "https://localhost"
    const url = new URL(path, host)
    return this.host ? url.href : url.pathname + url.search
  }

  clean_path(path: string, fromPath?: string) {
    path = this.path(path, fromPath)
    return removeSearch(path)
  }

  clean_url(path: string, fromPath?: string) {
    path = this.url(path, fromPath)
    return removeSearch(path)
  }

  asset(input: string) {
    return this.pipeline.manifest.get(input)
  }

  source(output: string, is_absolute = false, normalize = false) {
    output = cleanPath(output)

    const items = this.pipeline.manifest.all()
    const asset = (() => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.output == output || item.cache == output) {
          return item
        }
      }
    })()

    let input = output
    if (asset) input = this.pipeline.source.with(asset.source, asset.input, is_absolute)

    input = cleanPath(input)

    return normalize ? Path.normalize(input) : input
  }

  parse(path: string) {
    const root = this._root
    const is_absolute = Path.isAbsolute(path)

    // Build relative path
    let relative = path
    if (is_absolute) relative = Path.relative(root, path)

    // Build full path
    const full = Path.join(root, relative)

    // Clean paths
    const result: IPathObject = {
      relative: cleanPath(relative),
      full: cleanPath(full)
    }

    // Looking for source
    const source = this.pipeline.source.find_from_input(result.relative)

    // Build key and clean paths
    if (source) {
      result.source = cleanPath(source)
      result.key = cleanPath(Path.relative(source, result.relative))
    }

    return result
  }

  relative(from: string, to: string) {
    from = cleanPath(from)
    if (Path.isAbsolute(from)) from = Path.relative(this._root, from)

    to = cleanPath(to)
    if (Path.isAbsolute(to)) to = Path.relative(this._root, to)

    return cleanPath(Path.relative(from, to))
  }

  normalize(path: string) {
    return Path.normalize(path)
  }

  use(path: string) {
    path = cleanPath(path)
    if (this._used.indexOf(path) == -1) {
      this._used.push(path)
    }
  }

  is_used(path: string) {
    path = cleanPath(path)
    return this._used.indexOf(path) > -1
  }

  clean_used() {
    this._used = []
  }

  all_used() {
    return this._used.slice(0)
  }

}