import { IAsset, IDirectoryRule, IPipeline } from "./types";
import { Transform } from "./transform";
export declare class DirectoryPipeline implements IPipeline {
    private pid;
    private sid;
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
    constructor(pid: string, sid: string);
    private get pipeline();
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
    fetch(): void;
    protected _fetch(): IAsset[];
    protected _fetcher(): (globs: string[], ignores: string[]) => string[];
}
