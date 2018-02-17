/// <reference types="node" />
/// <reference types="when" />
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
export interface GlobItem {
    glob: string;
    ignore?: boolean;
    files?: string[];
    cache?: boolean;
    keep_path?: boolean;
    rename?: string;
    base_dir?: string;
    template?: object | boolean;
    edit?: (value: Buffer | string) => Buffer | string;
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
    prefix: string;
    asset_key: string | number;
    asset_host: string | null;
    force_resolve: boolean;
    save_manifest: boolean;
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
    resolve(force?: boolean): When.Promise<{}> | When.Promise<void>;
    render(): When.Promise<{} | null>;
    addEntry(input: string, output: string, parameters?: GlobItem): void;
    addFile(glob: string, parameters?: GlobItem): void;
    addDirectory(glob: string, parameters?: GlobItem): void;
    ignoreFile(glob: string): void;
    ignoreDirectory(glob: string): void;
}
