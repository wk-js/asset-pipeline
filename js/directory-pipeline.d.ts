import { IAsset, IDirectoryRule, IPipeline } from "./types";
import { Pipeline } from "./pipeline";
import { Transform } from "./transform";
export declare class DirectoryPipeline implements IPipeline {
    private _source;
    /**
     * Pipeline type
     */
    readonly type = "directory";
    /**
     * Transformation rules
     */
    rules: Transform;
    protected _shadows: IAsset[];
    protected _globToAdd: string[];
    protected _globToIgnore: string[];
    constructor(_source: string);
    /**
     * Append file pattern
     */
    add(pattern: string, transformRule?: IDirectoryRule): void;
    /**
     * Append file pattern to ignore
     */
    ignore(pattern: string): void;
    /**
     * Append non-existing file to the manifest. Rules are applied.
     */
    shadow(file: string): void;
    /**
     * Clone the pipeline
     */
    clone(directory: DirectoryPipeline): DirectoryPipeline;
    fetch(pipeline: Pipeline): void;
    protected _fetch(pipeline: Pipeline): IAsset[];
    protected _fetcher(): (globs: string[], ignores: string[]) => string[];
}
