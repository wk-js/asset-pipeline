export declare class Cache {
    enabled: boolean;
    saltKey: string;
    /**
     * Clone cache object
     */
    clone(cache: Cache): void;
    /**
     * Return "anyValue-hash"
     */
    hash(path: string, hash?: string): string;
    /**
     * Generate hash string
     */
    generateHash(str: string): string;
}
