import { PathBuilder, PathOrString, toPath, toWebString } from "./path/path";
import { URLBuilder } from "./path/url";
import { normalize } from "./path/utils";
import { ResolvedPath, TransformResult } from "./types";

const OUTSIDE_REG = /^\.\./

export class Resolver {
  host = new URLBuilder("/")
  output = new PathBuilder("public")

  protected _cwd = new PathBuilder(process.cwd())
  paths: TransformResult[] = []
  aliases: PathBuilder[] = []

  set(paths: TransformResult[]) {
    this.paths = paths.sort((a, b) => a[1].priority < b[1].priority ? -1 : 1)
  }

  alias(path: PathOrString) {
    this.aliases.push(toPath(path))
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

    for (const [filename, transformed] of this.paths) {
      if (path === filename && transformed.tag === tag) {
        paths.push({
          transformed: transformed,
          parameters
        })
      }
    }

    if (paths.length === 0 && !OUTSIDE_REG.test(path)) {
      for (const alias of this.aliases) {
        const p = alias.join(path).web()
        for (const [filename, transformed] of this.paths) {
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
    const _path = this._cwd.join(this.output, this.host.pathname, resolved.transformed.path)
    return this._cwd.relative(_path).web()
  }

  findInputPath(outputPath: PathOrString) {
    let _outpath = toWebString(outputPath)

    if (_outpath[0] === "/") {
      _outpath = _outpath.slice(1)
    }

    const transformed = this.paths.find(([input, result]) => (
      result.path === _outpath
    ))

    if (!transformed) {
      throw new Error(`Cannot find input for "${outputPath}"`)
    }

    return transformed
  }

  filter(predicate?: (value: TransformResult, index: number, array: TransformResult[]) => boolean) {
    if (!predicate) return this.paths.slice(0)
    return this.paths.filter(predicate)
  }

}