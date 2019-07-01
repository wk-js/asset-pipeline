import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { FileSystem } from "./file-system";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { SourceManager } from "./source-manager";
import { Cache } from "./cache";
export declare class Pipeline {
    verbose: boolean;
    cache: Cache;
    source: SourceManager;
    directory: DirectoryPipeline;
    file: FilePipeline;
    manifest: Manifest;
    resolve: Resolver;
    tree: Tree;
    fs: FileSystem;
    fetch(force?: boolean): Promise<void>;
    log(...args: any[]): void;
}
