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
export declare class PathBuilder {
    private path;
    constructor(path: string);
    clone(): PathBuilder;
    os(): string;
    unix(): string;
    web(): string;
    ext(): string;
    base(): string;
    name(): string;
    dir(): string;
    set(path: string): void;
    isAbsolute(): boolean;
    join(...parts: string[]): PathBuilder;
    with(...parts: string[]): PathBuilder;
    relative(to: string): PathBuilder;
    toString(type?: "unix" | "web" | "os"): string;
}
export declare class URLBuilder {
    private _origin;
    pathname: PathBuilder;
    constructor(path: string, _origin?: string);
    setURL(origin: string): void;
    setPathname(path: string): void;
    isValidURL(): boolean;
    clone(): URLBuilder;
    join(...parts: string[]): URLBuilder;
    with(...parts: string[]): URLBuilder;
    relative(to: string): URLBuilder;
    toString(): string;
    toURL(): URL;
}
