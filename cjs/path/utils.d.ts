/**
 * Normalize path to current os format (system), unix format (unix) or web format (web)
 */
export declare function normalize(path: string, type?: "unix" | "web" | "os"): string;
/**
 * Get all different normalized paths
 */
export declare function getNormalizedPaths(path: string): {
    os: string;
    unix: string;
    web: string;
};
/**
 * Remove hash and search parameters
 */
export declare function cleanup(path: string): string;
export declare function isValidURL(url: string): boolean;
