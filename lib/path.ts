import * as Path from "path";

const BACKSLASH_REG = /\\/g
const DOUBLE_BACKSLASH_REG = /\/\//
const CLEAN_URL_REG = /^\.\/|\/$/g
const SEARCH_HASH_REG = /\?|\#/

/**
 * Normalize path to current os format (system), unix format (unix) or web format (web)
 */
export function normalize(path: string, type: "unix" | "web" | "system" = "web"): string {
  switch (type) {
    case "system": return Path.normalize(path)
    case "unix":
      {
        path = normalize(path, "system")
        path = path.replace(BACKSLASH_REG, "/")
        while (path.match(DOUBLE_BACKSLASH_REG)) {
          path = path.replace(DOUBLE_BACKSLASH_REG, "/") // node on windows doesn't replace doubles
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
    system: normalize(path, "system"),
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

/**
 * Create a wrapper around the path
 */
export function createWrapper(path: string) {
  return new PathWrapper(path)
}

export class PathWrapper {
  constructor(private path: string) {
    this.path = normalize(path, "system")
  }

  clone() { return new PathWrapper(this.path) }
  raw() { return this.path }
  toWeb() { return normalize(this.path, "web") }
  ext() { return Path.extname(this.path) }
  base() { return Path.basename(this.path) }
  name() { return Path.basename(this.path, this.ext()) }
  dir() { return Path.dirname(this.path) }

  isAbsolute() {
    return Path.isAbsolute(this.path)
  }

  join(...parts: string[]) {
    return createWrapper(Path.join(this.path, ...parts))
  }

  with(...parts: string[]) {
    return this.join(...parts)
  }

  relative(to: string) {
    return createWrapper(Path.relative(this.path, to))
  }
}