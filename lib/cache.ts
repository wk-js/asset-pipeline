import { join, parse } from "path";
import { createHash } from "crypto";

export class Cache {

  // Toggle cache
  enabled: boolean = false

  // Set hash key
  saltKey: string = 'asset'

  /**
   * Clone cache object
   */
  clone(cache: Cache) {
    cache.enabled = this.enabled
  }

  /**
   * Return "anyValue-hash"
   */
  hash(path: string, hash?: string) {
    const pathObject = parse(path)
    hash = hash || this.generateHash(path + this.saltKey)
    return join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`)
  }

  /**
   * Generate hash string
   */
  generateHash(str: string) {
    return createHash('md5').update(str).digest('hex')
  }

}