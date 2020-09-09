import { IAsset, IOutput, IAssetWithSource } from "./types";
export declare class Manifest {
    private pid;
    private _file;
    readOnDisk: boolean;
    saveOnDisk: boolean;
    saveAtChange: boolean;
    constructor(pid: string);
    private get pipeline();
    clone(manifest: Manifest): void;
    get manifestPath(): string;
    /**
     * Check if manifest file is created
     */
    fileExists(): boolean;
    /**
     * Save manifest file
     */
    saveFile(): void;
    /**
     * Read manifest file
     */
    readFile(): void;
    /**
     * Remove manifest file
     */
    removeFile(): void;
    /**
     * Get Asset
     */
    get(input: string): IAsset | undefined;
    /**
     * Get AssetWithSource object from inputPath
     */
    getWithSource(input: string): IAssetWithSource | undefined;
    /**
     * Check asset exists
     */
    has(input: string): boolean;
    /**
     * Add asset
     */
    add(asset: IAsset): void;
    /**
     * Remove asset
     */
    remove(input: string | IAsset): void;
    /**
     * Clear manifest
     */
    clear(): void;
    /**
     * Export a list of all the assets
     */
    export(exportType?: "asset", tag?: string): IAsset[];
    export(exportType: "asset_key", tag?: string): Record<string, IAsset>;
    export(exportType: "asset_source", tag?: string): IAssetWithSource[];
    export(exportType: "asset_source_key", tag?: string): Record<string, IAssetWithSource>;
    export(exportType: "output", tag?: string): IOutput[];
    export(exportType: "output_key", tag?: string): Record<string, IOutput>;
}
