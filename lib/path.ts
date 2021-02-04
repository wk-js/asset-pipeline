import * as Path from "path";

const WIN32_SEP_REG = /\\/g
const DOUBLE_BACKSLASH_REG = /\/\//
const CLEAN_URL_START_REG = /^\.\//
const CLEAN_URL_END_REG = /\/$/
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
        path = path.replace(CLEAN_URL_START_REG, "")
        if (!(path.length === 1 && CLEAN_URL_END_REG.test(path))) {
          path = path.replace(CLEAN_URL_END_REG, "")
        }
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

export function isValidURL(url: string) {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export class PathBuilder {
  constructor(private path: string) {
    if (typeof path !== "string") throw new Error("Path should not be empty")
    this.path = normalize(path, "os")
  }

  clone() { return new PathBuilder(this.path) }
  os() { return normalize(this.path, "os") }
  unix() { return normalize(this.path, "unix") }
  web() { return normalize(this.path, "web") }
  ext() { return Path.extname(this.path) }
  base() { return Path.basename(this.path) }
  name() { return Path.basename(this.path, this.ext()) }
  dir() { return Path.dirname(this.path) }
  set(path: string) {
    if (typeof path !== "string") throw new Error("[asset-pipeline][path] Path should not be empty")
    this.path = path
    return this
  }

  isAbsolute() {
    return Path.isAbsolute(this.path)
  }

  join(...parts: string[]) {
    return new PathBuilder(Path.join(this.path, ...parts))
  }

  with(...parts: string[]) {
    return this.join(...parts)
  }

  relative(to: string) {
    return new PathBuilder(Path.relative(this.path, to))
  }

  toString(type: "unix" | "web" | "os" = "os") {
    return normalize(this.path, type)
  }
}

export class URLBuilder {
  pathname: PathBuilder

  constructor(path: string, private _origin: string = "") {
    this.pathname = new PathBuilder(path)
  }

  set(url: string) {
    if (typeof url !== "string") throw new Error(`[asset-pipeline][path] Orign should be a string. An empty string is accepted.`)

    try {
      const u = new URL(url)
      this._origin = u.origin
      this.setPathname(u.pathname)
    } catch (e) {
      this._origin = ""
      this.pathname.set("/")
    }

    return this
  }

  setOrigin(origin: string) {
    if (typeof origin !== "string") throw new Error(`[asset-pipeline][path] Orign should be a string. An empty string is accepted.`)

    try {
      const u = new URL(this.pathname.unix(), origin)
      this._origin = u.origin
      this.setPathname(u.pathname)
    } catch (e) {
      this._origin = ""
    }

    return this
  }

  setPathname(path: string) {
    this.pathname.set(path)
    return this
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
    if (this.isValidURL()) {
      return this.toURL().href
    }
    return this.pathname.web()
  }

  toURL() {
    return new URL(this.pathname.toString("web"), this._origin)
  }
}