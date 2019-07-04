import { join, parse } from "path";
import { createHash } from "crypto";

export class Cache {

  enabled: boolean = false
  type: string = 'hash'
  key: string | number = 'no_key'
  private count = 0

  clone(cache: Cache) {
    this.count++
    cache.enabled = this.enabled
    cache.type = this.type
    cache.key = this.key + " copy " + this.count
  }

  hash(path: string) {
    const pathObject = parse(path)
    const hash = this.generateHash(path + this.key)
    return join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`)
  }

  version(path: string) {
    const pathObject = parse(path)
    return join(pathObject.dir, `${pathObject.name}${pathObject.ext}?v=${this.key}`)
  }

  generateHash(str: string) {
    return createHash('md5').update(str).digest('hex')
  }

}