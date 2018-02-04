'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const crypto_1 = require("crypto");
function hashCache(path, asset_key) {
    const pathObject = path_1.parse(path);
    const hash = generateHash(path + asset_key);
    return path_1.join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`);
}
exports.hashCache = hashCache;
function versionCache(path, version) {
    const pathObject = path_1.parse(path);
    return path_1.join(pathObject.dir, `${pathObject.name}${pathObject.ext}?v=${version}`);
}
exports.versionCache = versionCache;
function generateHash(str) {
    return crypto_1.createHash('md5').update(str).digest('hex');
}
exports.generateHash = generateHash;
