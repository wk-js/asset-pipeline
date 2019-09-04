import { Pipeline } from "./pipeline";
import { IAsset, IFileRule, IPipeline } from "./types";
import { Transform } from "./transform";
export declare class FilePipeline implements IPipeline {
    /**
     * Pipeline type
     */
    readonly type = "file";
    /**
     * Transformation rules
     */
    rules: Transform;
    protected _shadows: IAsset[];
    protected _globToAdd: string[];
    protected _globToIgnore: string[];
    /**
     * Add file pattern
     */
    add(pattern: string, transformRule?: IFileRule): void;
    /**
     * Add file pattern to ignore
     */
    ignore(pattern: string): void;
    /**
     * Add non-existing file to the manifest. Rules are applied.
     */
    shadow(file: string): void;
    /**
     * Clone the pipeline
     */
    clone(file: FilePipeline): FilePipeline;
    /**
     * Collect a list of files matching patterns, then apply transformation rules
     */
    fetch(pipeline: Pipeline): void;
    protected _fetch(pipeline: Pipeline): IAsset[];
    private _fetcher;
}
