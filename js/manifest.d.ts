import { AssetPipeline, AssetItem } from "./asset-pipeline";
export interface ManifestFile {
    asset_key: string | number;
    date: Date;
    load_path: string[];
    dst_path: string;
    assets: Record<string, AssetItem>;
}
export declare class Manifest {
    pipeline: AssetPipeline;
    manifest: ManifestFile;
    constructor(pipeline: AssetPipeline);
    readonly manifest_path: string;
    fileExists(): boolean;
    createFile(): Promise<void>;
    updateFile(): Promise<void>;
    readFile(): Promise<void>;
    deleteFile(): Promise<void>;
}
