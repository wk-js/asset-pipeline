import { AssetPipeline, AssetItem } from "./asset-pipeline";
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
    createFile(): Promise<boolean>;
    updateFile(): Promise<boolean>;
    readFile(): Promise<boolean>;
    deleteFile(): Promise<boolean>;
}
