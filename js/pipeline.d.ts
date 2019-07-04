import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Manifest } from "./manifest";
import { FileSystem } from "./file-system";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { Source } from "./source";
import { Cache } from "./cache";
export declare class Pipeline {
    verbose: boolean;
    cache: Cache;
    source: Source;
    directory: DirectoryPipeline;
    file: FilePipeline;
    manifest: Manifest;
    resolve: Resolver;
    tree: Tree;
    fs: FileSystem;
    clone(): Pipeline;
    fetch(force?: boolean): Promise<void>;
    log(...args: any[]): void;
}
