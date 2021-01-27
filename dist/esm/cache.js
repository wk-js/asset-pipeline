import { join, parse } from "path";
import { createHash } from "crypto";
export class Cache {
    constructor() {
        // Toggle cache
        this.enabled = false;
        // Set hash key
        this.saltKey = 'asset';
    }
    /**
     * Clone cache object
     */
    clone(cache) {
        cache.enabled = this.enabled;
    }
    /**
     * Return "anyValue-hash"
     */
    hash(path, hash) {
        const pathObject = parse(path);
        hash = hash || this.generateHash(path + this.saltKey);
        return join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`);
    }
    /**
     * Generate hash string
     */
    generateHash(str) {
        return createHash('md5').update(str).digest('hex');
    }
}
