import { Pipeline } from "./pipeline";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Resolver } from "./resolver";
import { FileSystem } from "./file-system";
export declare class SourceMap {
    private _paths;
    clone(source: SourceMap): void;
    add(path: string): Source;
    get(path: string): Source | undefined;
    has(path: string): boolean;
    remove(path: string): Source | undefined;
    paths(resolver: Resolver, is_absolute?: boolean): string[];
    fetch(pipeline: Pipeline, type?: "file" | "directory"): void;
    copy(pipeline: Pipeline, force?: boolean): Promise<void>;
}
export declare class Source {
    path: string;
    file: FilePipeline;
    directory: DirectoryPipeline;
    fs: FileSystem;
    join(resolver: Resolver, input: string, absolute?: boolean): string;
}
