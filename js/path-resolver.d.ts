import { Pipeline } from "./pipeline";
import { IAsset } from "./types";
export interface TreeInterface {
    path: string;
    files: string[];
    subdirectories: {
        [key: string]: TreeInterface;
    };
}
export declare class PathResolver {
    private pipeline;
    _tree: TreeInterface;
    _resolved_paths: string[];
    constructor(pipeline: Pipeline);
    readonly manifest: import("./types").IManifest;
    readonly cacheable: boolean;
    readonly host: string | null;
    update(): void;
    resolve(path: string): TreeInterface;
    getAsset(path: string): IAsset;
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
    getSourceFilePath(path: string, fromPath?: string): string;
    view(): string;
    private _resolved;
    is_resolved(path: string): boolean;
    get_resolved(): Record<string, IAsset>;
    clean_resolved(): void;
}
