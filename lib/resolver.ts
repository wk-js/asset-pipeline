import { cleanPath, toUnixPath, removeSearch } from "./utils/path";
import Path from "path";
import { Pipeline } from "./pipeline";

export class Resolver {

  private _output: string = 'public'
  private _used: string[] = []
  private _root: string = process.cwd()
  public host: string = ''

  constructor(private pipeline: Pipeline) { }

  root(path?: string) {
    if (path) {
      if (!Path.isAbsolute(path)) throw new Error('Root must be absolute')
      this._root = cleanPath(path)
    }
    return this._root
  }

  output(path?: string) {
    if (path) this._output = cleanPath(path)

    return this._output
  }

  output_with(path: string, is_absolute = true) {
    path = cleanPath(path)
    if (is_absolute) {
      path = Path.join(this.root(), this._output, path)
    } else {
      path = Path.join(this._output, path)
    }
    return cleanPath(path)
  }

  relative(from: string, to: string) {
    from = cleanPath(from)
    if (Path.isAbsolute(from)) from = Path.relative(this.root(), from)
    to = cleanPath(to)
    if (Path.isAbsolute(to)) to = Path.relative(this.root(), to)

    return cleanPath(Path.relative(from, to))
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

    if (this.host) {
      const url = new URL(path, this.host)
      path = url.href
    }

    return path
  }

  clean_path(path: string, fromPath?: string) {
    path = this.path(path, fromPath)
    return removeSearch(path)
  }

  clean_url(path: string, fromPath?: string) {
    path = this.url(path, fromPath)
    return removeSearch(path)
  }

  find_path(path: string) {
    const load_path = this.pipeline.source.find_from(path, true)
    if (!load_path) return path
    const relative_path = this.relative(load_path, path)
    const output = this.pipeline.resolve.path(relative_path)
    return output
  }

  find_url(path: string) {
    const load_path = this.pipeline.source.find_from(path, true)
    if (!load_path) return path
    const relative_path = this.relative(load_path, path)
    const output = this.pipeline.resolve.url(relative_path)
    return output
  }

  asset(input: string) {
    return this.pipeline.manifest.get(input)
  }

  source_from_output(output: string, is_absolute = false, normalize = false) {
    output = cleanPath(output)

    const items = this.pipeline.manifest.all()
    let asset: any = null

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.output == output || item.cache == output) {
        asset = item
        break;
      }
    }

    let input = output
    if (asset) input = this.pipeline.source.source_with(asset.load_path, asset.input, is_absolute)

    input = cleanPath(input)

    return normalize ? Path.normalize(input) : input
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