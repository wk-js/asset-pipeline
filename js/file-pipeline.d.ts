import { AssetPipeline, GlobItem, AssetItem } from "./asset-pipeline";
export declare class FilePipeline {
    pipeline: AssetPipeline;
    protected _globs: GlobItem[];
    constructor(pipeline: AssetPipeline);
    readonly manifest: {
        ASSET_KEY: string | number;
        DATE: Date;
        LOAD_PATH: string;
        DIST_PATH: string;
        ASSETS: {
            [key: string]: AssetItem;
        };
    };
    add(glob: string, parameters?: GlobItem): void;
    ignore(glob: string): void;
    fetch(): void;
    getRules(file: string): {};
    resolve(file: string): void;
    resolveOutput(file: string, rules: GlobItem, isAlternative?: boolean): void;
}
