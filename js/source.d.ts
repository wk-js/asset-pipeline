import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { FileSystem } from "./file-system";
import { PathBuilder } from "./path";
export declare class SourceManager {
    private pid;
    private _sources;
    constructor(pid: string);
    clone(source: SourceManager): void;
    add(path: string): Source;
    get(uuid: string): Source | undefined;
    has(uuid: string): boolean;
    remove(uuid: string): Source | undefined;
    all(type?: "array"): Source[];
    all(type: "object"): Record<string, Source>;
    fetch(type: "file" | "directory"): void;
    copy(force?: boolean): Promise<void>;
}
export declare class Source {
    private pid;
    uuid: string;
    file: FilePipeline;
    directory: DirectoryPipeline;
    fs: FileSystem;
    path: PathBuilder;
    fullpath: PathBuilder;
    constructor(path: string, pid: string);
    get pipeline(): import("./pipeline").Pipeline | undefined;
}
