import { IAsset, IFileRule, IPipeline } from "./types";
import { Transform } from "./transform";
export declare class FilePipeline implements IPipeline {
    private pid;
    private sid;
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
    constructor(pid: string, sid: string);
    private get pipeline();
    /**
     * Add file pattern
     */
    add(pattern: string, transformRule?: IFileRule): this;
    /**
     * Add file pattern to ignore
     */
    ignore(pattern: string): this;
    /**
     * Add non-existing file to the manifest. Rules are applied.
     */
    shadow(file: string, transformRule?: IFileRule): this;
    /**
     * Clone the pipeline
     */
    clone(file: FilePipeline): FilePipeline;
    /**
     * Collect a list of files matching patterns, then apply transformation rules
     */
    fetch(): void;
    protected _fetch(): IAsset[];
    private _fetcher;
}
