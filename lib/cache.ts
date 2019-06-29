import { join, parse } from "path";
import { createHash } from "crypto";

export function hashCache(path: string, asset_key: string | number) {
  const pathObject = parse(path)
  const hash = generateHash(path + asset_key)
  return join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`)
}

export function versionCache(path: string, version: string | number) {
  const pathObject = parse(path)
  return join(pathObject.dir, `${pathObject.name}${pathObject.ext}?v=${version}`)
}

export function generateHash(str: string) {
  return createHash('md5').update(str).digest('hex')
}