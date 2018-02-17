/// <reference types="when" />
import { AssetPipeline, AssetItem } from "./asset-pipeline";
import when from 'when';
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
    constructor(pipeline: AssetPipeline);
    readonly manifest_path: string;
    fileExists(): boolean;
    createFile(): when.Promise<{}>;
    updateFile(): when.Promise<{}>;
    readFile(): when.Promise<{}> | when.Promise<void>;
    deleteFile(): when.Promise<boolean>;
}
