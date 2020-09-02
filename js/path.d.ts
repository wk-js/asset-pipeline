/**
 * Normalize path to current os format (system), unix format (unix) or web format (web)
 */
export declare function normalize(path: string, type?: "unix" | "web" | "system"): string;
/**
 * Get all different normalized paths
 */
export declare function getNormalizedPaths(path: string): {
    system: string;
    unix: string;
    web: string;
};
/**
 * Remove hash and search parameters
 */
export declare function cleanup(path: string): string;
/**
 * Create a wrapper around the path
 */
export declare function createWrapper(path: string): PathWrapper;
export declare class PathWrapper {
    private path;
    constructor(path: string);
    clone(): PathWrapper;
    raw(): string;
    toWeb(): string;
    ext(): string;
    base(): string;
    name(): string;
    dir(): string;
    isAbsolute(): boolean;
    join(...parts: string[]): PathWrapper;
    with(...parts: string[]): PathWrapper;
    relative(to: string): PathWrapper;
}
