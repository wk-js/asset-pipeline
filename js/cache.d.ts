export declare class Cache {
    enabled: boolean;
    type: string;
    key: string | number;
    clone(cache: Cache): void;
    hash(path: string): string;
    version(path: string): string;
    generateHash(str: string): string;
}
