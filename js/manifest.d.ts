/// <reference types="when" />
import { AssetPipeline, AssetItem } from "./asset-pipeline";
import when from 'when';
export interface ManifestFile {
    asset_key: string | number;
    date: Date;
    load_path: string;
    dst_path: string;
    assets: {
        [key: string]: AssetItem;
    };
}
export declare class Manifest {
    pipeline: AssetPipeline;
    manifest: ManifestFile;
    constructor(pipeline: AssetPipeline);
    readonly manifest_path: string;
    fileExists(): boolean;
    createFile(): when.Promise<boolean>;
    updateFile(): when.Promise<boolean>;
    readFile(): when.Promise<boolean>;
    deleteFile(): when.Promise<boolean>;
}
