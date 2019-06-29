import { Pipeline } from "./pipeline";
import { IFileRule, IAsset, IMatchRule } from "./types";
export declare class FilePipeline {
    pipeline: Pipeline;
    rules: IMatchRule[];
    type: string;
    constructor(pipeline: Pipeline);
    readonly manifest: import("./types").IManifest;
    readonly cacheable: boolean;
    readonly cache_type: string;
    readonly hash_key: string | number;
    readonly load_paths: import("./file-matcher").FileMatcher;
    readonly resolver: import("./path-resolver").PathResolver;
    add(glob: string, parameters?: IFileRule): void;
    addEntry(input: string, output: string, parameters?: IFileRule): void;
    ignore(glob: string): void;
    fetch(): void;
    resolve(asset: IAsset): void;
    resolveOutput(file: string, rules: IMatchRule): void;
}
