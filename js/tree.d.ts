import { AssetPipeline } from "./asset-pipeline";
import { ManifestFile } from "./manifest";
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
    constructor(pipeline: AssetPipeline);
    readonly manifest: ManifestFile;
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
}
