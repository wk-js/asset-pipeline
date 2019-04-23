import { EditFileCallback } from './utils/fs';
import { Tree } from "./tree";
import { Manager } from "./manager";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { Renderer } from "./renderer";
export interface AlternativeOutputs {
    condition: string;
    outputs: any[];
}
export interface Rules {
    ignore?: boolean;
    files?: string[];
    cache?: boolean;
    keep_path?: boolean;
    rename?: string;
    base_dir?: string;
    template?: object | boolean;
    edit?: EditFileCallback;
    resolve?: (output: string, file: string, rules: AssetItemRules) => string;
    data?: any;
}
export interface AssetItemRules extends Rules {
    glob: string;
}
export interface AssetItem {
    input: string;
    output: string;
    cache: string;
    data?: any;
}
export declare class AssetPipeline {
    load_path: string;
    dst_path: string;
    root_path: string;
    cacheable: boolean;
    cache_type: string;
    prefix: string;
    asset_key: string | number;
    asset_host: string | null;
    force_resolve: boolean;
    save_manifest: boolean;
    verbose: boolean;
    data: any;
    tree: Tree;
    manager: Manager;
    manifest: Manifest;
    renderer: Renderer;
    file: FilePipeline;
    directory: DirectoryPipeline;
    readonly absolute_load_path: string;
    readonly absolute_dst_path: string;
    fromLoadPath(path: string): string;
    fromDstPath(path: string): string;
    relativeToLoadPath(path: string): string;
    getPath(path: string, fromPath?: string): string;
    getUrl(path: string, fromPath?: string): string;
    resolve(force?: boolean): Promise<boolean>;
    render(): Promise<void>;
    addEntry(input: string, output: string, parameters?: Rules): void;
    addFile(glob: string, parameters?: Rules): void;
    addDirectory(glob: string, parameters?: Rules): void;
    ignoreFile(glob: string): void;
    ignoreDirectory(glob: string): void;
    getFileRules(file: string): {};
    getDirectoryRules(directory: string): AssetItemRules;
    log(...args: any[]): void;
}
