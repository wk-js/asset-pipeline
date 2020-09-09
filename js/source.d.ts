import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { FileSystem } from "./file-system";
import { PathBuilder } from "./path";
export declare class SourceManager {
    private pid;
    private _sources;
    constructor(pid: string);
    /**
     * Clone SourceMananger
     */
    clone(source: SourceManager): void;
    /**
     * Add a new source path, relative to cwd
     */
    add(path: string): Source;
    /**
     * Get the source object from source uuid
     */
    get(uuid: string): Source | undefined;
    /**
     * Check source exists
     */
    has(uuid: string): boolean;
    /**
     * Remove source
     */
    remove(uuid: string): Source | undefined;
    /**
     * Return all sources
     */
    all(type?: "array"): Source[];
    all(type: "object"): Record<string, Source>;
    fetch(type: "file" | "directory"): void;
    copy(force?: boolean): Promise<void>;
}
export declare class Source {
    uuid: string;
    file: FilePipeline;
    directory: DirectoryPipeline;
    fs: FileSystem;
    path: PathBuilder;
    fullpath: PathBuilder;
    constructor(path: string, pid: string);
}
