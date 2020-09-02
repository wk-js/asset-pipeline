"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const path_1 = require("path");
const crypto_1 = require("crypto");
class Cache {
    constructor() {
        this.enabled = false;
        this.type = 'hash';
        this.key = 'no_key';
    }
    clone(cache) {
        cache.enabled = this.enabled;
        cache.type = this.type;
    }
    hash(path) {
        const pathObject = path_1.parse(path);
        const hash = this.generateHash(path + this.key);
        return path_1.join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`);
    }
    version(path) {
        const pathObject = path_1.parse(path);
        return path_1.join(pathObject.dir, `${pathObject.name}${pathObject.ext}?v=${this.key}`);
    }
    generateHash(str) {
        return crypto_1.createHash('md5').update(str).digest('hex');
    }
}
exports.Cache = Cache;
