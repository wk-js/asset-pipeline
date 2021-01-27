import { IAsset, IFileRule, IMatchRule } from "./types";
export declare class FilePipeline {
    private pid;
    private sid;
    /**
     * Pipeline type
     */
    readonly type = "file";
    /**
     * Transformation rules
     */
    protected _rules: Record<string, IMatchRule>;
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
     * Clone the pipeline
     */
    clone(file: FilePipeline): FilePipeline;
    /**
     * Collect a list of files matching patterns, then apply transformation rules, then add to manifest
     */
    fetch(): void;
    protected _fetch(): IAsset[];
    private _fetcher;
}
