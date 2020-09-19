"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const path_1 = require("path");
const crypto_1 = require("crypto");
class Cache {
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
        const pathObject = path_1.parse(path);
        hash = hash || this.generateHash(path + this.saltKey);
        return path_1.join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`);
    }
    /**
     * Generate hash string
     */
    generateHash(str) {
        return crypto_1.createHash('md5').update(str).digest('hex');
    }
}
exports.Cache = Cache;
