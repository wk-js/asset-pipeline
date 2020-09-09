import * as Path from "path";

const WIN32_SEP_REG = /\\/g
const DOUBLE_BACKSLASH_REG = /\/\//
const CLEAN_URL_REG = /^\.\/|\/$/g
const SEARCH_HASH_REG = /\?|\#/

/**
 * Normalize path to current os format (system), unix format (unix) or web format (web)
 */
export function normalize(path: string, type: "unix" | "web" | "os" = "web"): string {
  switch (type) {
    case "os": return Path.normalize(path)
    case "unix":
      {
        path = normalize(path, "os")
        path = path.replace(WIN32_SEP_REG, Path.posix.sep)
        while (path.match(DOUBLE_BACKSLASH_REG)) {
          path = path.replace(DOUBLE_BACKSLASH_REG, Path.posix.sep) // node on windows doesn't replace doubles
        }
        return path
      }
    case "web":
      {
        path = normalize(path, "unix")
        path = path.replace(CLEAN_URL_REG, "")
        return path
      }
  }
}

/**
 * Get all different normalized paths
 */
export function getNormalizedPaths(path: string) {
  return {
    os: normalize(path, "os"),
    unix: normalize(path, "unix"),
    web: normalize(path, "web"),
  }
}

/**
 * Remove hash and search parameters
 */
export function cleanup(path: string) {
  return path.split(SEARCH_HASH_REG)[0]
}

export class PathBuilder {
  constructor(private _path: string) {
    this._path = normalize(_path, "os")
  }

  clone() { return new PathBuilder(this._path) }
  os() { return normalize(this._path, "os") }
  unix() { return normalize(this._path, "unix") }
  web() { return normalize(this._path, "web") }
  ext() { return Path.extname(this._path) }
  base() { return Path.basename(this._path) }
  name() { return Path.basename(this._path, this.ext()) }
  dir() { return Path.dirname(this._path) }
  set(path: string) { this._path = path }

  isAbsolute() {
    return Path.isAbsolute(this._path)
  }

  join(...parts: string[]) {
    return new PathBuilder(Path.join(this._path, ...parts))
  }

  with(...parts: string[]) {
    return this.join(...parts)
  }

  relative(to: string) {
    return new PathBuilder(Path.relative(this._path, to))
  }

  toString(type: "unix" | "web" | "os" = "os") {
    return normalize(this._path, type)
  }
}

export class URLBuilder {
  pathname: PathBuilder

  constructor(_path: string, private _origin: string = "") {
    this.pathname = new PathBuilder(_path)
  }

  setOrigin(_origin: string) {
    this._origin = _origin
  }

  setPathname(_path: string) {
    this.pathname["_path"] = _path
  }

  isValidURL() {
    try {
      new URL(this.pathname.toString("web"), this._origin)
      return true
    } catch (e) {
      return false
    }
  }

  clone() { return new URLBuilder(this.pathname.web(), this._origin) }

  join(...parts: string[]) {
    return new URLBuilder(this.pathname.join(...parts).web(), this._origin)
  }

  with(...parts: string[]) {
    return this.join(...parts)
  }

  relative(to: string) {
    return new URLBuilder(this.pathname.relative(to).web(), this._origin)
  }

  toString() {
    return this._origin + this.pathname.web()
  }

  toURL() {
    return new URL(this.pathname.toString("web"), this._origin)
  }
}