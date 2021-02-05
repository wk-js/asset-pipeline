import { PathBuilder, PathOrString, toPath } from "./path/path";
import { URLBuilder } from "./path/url";
import { normalize } from "./path/utils";
import { ResolvedPath, TransformResult } from "./types";

export class Resolver {
  host = new URLBuilder("/")
  output = new PathBuilder("public")

  protected _cwd = new PathBuilder(process.cwd())
  protected _paths: TransformResult[] = []
  protected _aliases: PathBuilder[] = []

  set(paths: TransformResult[]) {
    this._paths = paths.sort((a, b) => a[1].priority < b[1].priority ? -1 : 1)
  }

  alias(path: PathOrString) {
    this._aliases.push(toPath(path))
    return this
  }

  resolve(path: string, tag = "default") {
    path = normalize(path, "web")
    const original = path
    const extra = path.match(/\#|\?/)
    let parameters = ''

    if (extra) {
      parameters = extra[0] + path.split(extra[0])[1]
      path = path.split(extra[0])[0]
    }

    const paths: ResolvedPath[] = []

    for (const [filename, transformed] of this._paths) {
      if (path === filename && transformed.tag === tag) {
        paths.push({
          transformed: transformed,
          parameters
        })
      }
    }

    if (paths.length === 0) {
      for (const alias of this._aliases) {
        const p = alias.join(path).web()
        for (const [filename, transformed] of this._paths) {
          if (p === filename && transformed.tag === tag) {
            paths.push({
              transformed: transformed,
              parameters
            })
          }
        }
      }
    }

    if (paths.length === 0) {
      throw new Error(`Could not resolve "${original}"`)
    }

    return paths.reverse()
  }

  getTransformedPath(path: string, tag?: string) {
    const paths = this.resolve(path, tag)
    return paths[0].transformed
  }

  getPath(path: string, tag?: string) {
    const resolved = this.resolve(path, tag)[0]
    path = resolved.transformed.path + resolved.parameters
    return this.host.pathname.join(path).web()
  }

  getUrl(path: string, tag?: string) {
    const resolved = this.resolve(path, tag)[0]
    path = resolved.transformed.path + resolved.parameters
    return this.host.join(path).toString()
  }

  getOutputPath(path: string, tag?: string) {
    const resolved = this.resolve(path, tag)[0]
    const _path = this._cwd.join(this.host.pathname, this.output, resolved.transformed.path)
    return this._cwd.relative(_path).web()
  }

  filter(predicate?: (value: TransformResult, index: number, array: TransformResult[]) => boolean) {
    if (!predicate) return this._paths.slice(0)
    return this._paths.filter(predicate)
  }

}