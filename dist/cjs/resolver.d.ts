import { IResolvePathOptions } from "./types";
export interface TreeInterface {
    name: string;
    path: string;
    files: string[];
    subdirectories: {
        [key: string]: TreeInterface;
    };
}
export declare class Resolver {
    private pid;
    root: TreeInterface;
    constructor(pid: string);
    private get pipeline();
    /**
     * Look for outputPath
     */
    resolve(inputPath: string): string;
    /**
     * Refresh output tree
     */
    refreshTree(): void;
    /**
     * Convert inputPath to outputPath and return its directory tree
     */
    getTree(inputPath: string): TreeInterface;
    /**
     * Get path
     */
    getPath(inputPath: string, options?: Partial<IResolvePathOptions>): string;
    /**
     * Get path
     */
    private _getPath;
    /**
     * Get url
     */
    getUrl(inputPath: string, options?: Partial<IResolvePathOptions>): string;
    /**
     * Preview output tree
     */
    view(): string;
}
