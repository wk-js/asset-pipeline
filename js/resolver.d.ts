export interface TreeInterface {
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
     * Preview output tree
     */
    view(): string;
}
