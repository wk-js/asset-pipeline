import { createHash } from "crypto";
/**
 * Generate hash string
 */
export function generateHash(str) {
    return createHash('md5').update(str).digest('hex');
}
