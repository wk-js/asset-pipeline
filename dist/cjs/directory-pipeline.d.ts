import { IAsset, IDirectoryRule, IMatchRule } from "./types";
export declare class DirectoryPipeline {
    private pid;
    private sid;
    /**
     * Pipeline type
     */
    readonly type = "directory";
    /**
     * Transformation rules
     */
    protected _rules: Record<string, IMatchRule>;
    constructor(pid: string, sid: string);
    private get pipeline();
    /**
     * Append file pattern
     */
    add(pattern: string, transformRule?: IDirectoryRule): this;
    /**
     * Append file pattern to ignore
     */
    ignore(pattern: string): this;
    /**
     * Clone the pipeline
     */
    clone(directory: DirectoryPipeline): DirectoryPipeline;
    /**
     * Collect a list of directories matching patterns, apply transformation rules, then add to manifest
     */
    fetch(): void;
    protected _fetch(): IAsset[];
    protected _fetcher(): (globs: string[], ignores: string[]) => string[];
}
