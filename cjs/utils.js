"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHash = void 0;
const crypto_1 = require("crypto");
/**
 * Generate hash string
 */
function generateHash(str) {
    return crypto_1.createHash('md5').update(str).digest('hex');
}
exports.generateHash = generateHash;
