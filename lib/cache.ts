import { join, parse } from "path";
import { createHash } from "crypto";

export class Cache {

  // Toggle cache
  enabled: boolean = false

  // Set cache type "hash" | "version" (Default: "hash")
  type: string = 'hash'

  // Set hash key
  key: string | number = 'no_key'

  /**
   * Clone cache object
   */
  clone(cache: Cache) {
    cache.enabled = this.enabled
    cache.type = this.type
  }

  /**
   * Return "anyValue-hash"
   */
  hash(path: string) {
    const pathObject = parse(path)
    const hash = this.generateHash(path + this.key)
    return join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`)
  }

  /**
   * Return "anyValue?v=hashKey"
   */
  version(path: string) {
    const pathObject = parse(path)
    return join(pathObject.dir, `${pathObject.name}${pathObject.ext}?v=${this.key}`)
  }

  /**
   * Generate hash string
   */
  generateHash(str: string) {
    return createHash('md5').update(str).digest('hex')
  }

}