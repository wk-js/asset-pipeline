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
