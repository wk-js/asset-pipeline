import { AssetPipeline, AssetItem } from "./asset-pipeline";
export interface TreeInterface {
    path: string;
    files: string[];
    subdirectories: {
        [key: string]: TreeInterface;
    };
}
export declare class Tree {
    pipeline: AssetPipeline;
    _tree: TreeInterface;
    _resolved_paths: string[];
    constructor(pipeline: AssetPipeline);
    readonly manifest: import("./manifest").ManifestFile;
    update(): void;
    resolve(path: string): TreeInterface;
    buildPath(path: string): string;
    /**
     * @param {string} path - Path required
     * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
     */
    getPath(path: string, fromPath?: string): string;
    /**
     * @param {string} path - Path required
     * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
     */
    getUrl(path: string, fromPath?: string): string;
    getFilePath(path: string, fromPath?: string): string;
    getFileUrl(path: string, fromPath?: string): string;
    view(): string;
    private _resolved;
    is_resolved(path: string): boolean;
    get_resolved(): Record<string, AssetItem>;
    clean_resolved(): void;
}
