export declare class Cache {
    enabled: boolean;
    type: string;
    key: string | number;
    /**
     * Clone cache object
     */
    clone(cache: Cache): void;
    /**
     * Return "anyValue-hash"
     */
    hash(path: string): string;
    /**
     * Return "anyValue?v=hashKey"
     */
    version(path: string): string;
    /**
     * Generate hash string
     */
    generateHash(str: string): string;
}
