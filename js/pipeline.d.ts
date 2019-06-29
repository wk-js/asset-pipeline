import { PathResolver } from "./path-resolver";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { FileMatcher } from "./file-matcher";
import { FileSystem } from "./file-system";
export declare class Pipeline {
    dst_path: string;
    root_path: string;
    cacheable: boolean;
    cache_type: string;
    hash_key: string | number;
    host: string | null;
    verbose: boolean;
    load_paths: FileMatcher;
    directory: DirectoryPipeline;
    file: FilePipeline;
    manifest: Manifest;
    resolver: PathResolver;
    fs: FileSystem;
    readonly absolute_dst_path: string;
    fromDstPath(path: string): string;
    resolve(force?: boolean): Promise<void>;
    log(...args: any[]): void;
}
