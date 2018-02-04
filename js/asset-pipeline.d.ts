import { Tree } from "./tree";
import { Manager } from "./manager";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
export interface AlternativeOutputs {
    condition: string;
    outputs: any[];
}
export interface GlobItem {
    glob: string;
    ignore?: boolean;
    files?: string[];
    cache?: boolean;
    keep_path?: boolean;
    rename?: string;
    baseDir?: string;
    data?: any;
    alternatives?: AlternativeOutputs;
}
export interface AssetItem {
    input: string;
    output: string;
    cache: string;
    data?: any;
    alternatives?: AlternativeOutputs;
}
export declare class AssetPipeline {
    load_path: string;
    dst_path: string;
    root_path: string;
    cacheable: boolean;
    cacheType: string;
    prefix: string;
    asset_key: string | number;
    asset_host: string | null;
    forceResolve: boolean;
    data: any;
    tree: Tree;
    manager: Manager;
    manifest: Manifest;
    file: FilePipeline;
    directory: DirectoryPipeline;
    readonly absolute_load_path: string;
    readonly absolute_dst_path: string;
    fromLoadPath(path: string): string;
    fromDstPath(path: string): string;
    relativeToLoadPath(path: string): string;
    getPath(path: string, fromPath?: string): string;
    getUrl(path: string, fromPath?: string): string;
    resolve(force?: boolean): any;
    addEntry(input: string, output: string, parameters?: GlobItem): void;
    addFile(glob: string, parameters: GlobItem): void;
    addDirectory(glob: string, parameters: GlobItem): void;
    ignoreFile(glob: string): void;
    ignoreDirectory(glob: string): void;
}
