import { AssetPipeline, AssetItem } from "./asset-pipeline";
export declare class Manifest {
    pipeline: AssetPipeline;
    manifest: {
        ASSET_KEY: string | number;
        DATE: Date;
        LOAD_PATH: string;
        DIST_PATH: string;
        ASSETS: {
            [key: string]: AssetItem;
        };
    };
    forceUpdate: boolean;
    constructor(pipeline: AssetPipeline);
    readonly manifest_path: string;
    fileExists(): boolean;
    createFile(): any;
    updateFile(): any;
    readFile(): any;
    deleteFile(): any;
}
