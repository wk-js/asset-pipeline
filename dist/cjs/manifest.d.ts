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
    getAsset(inputPath: string): IAsset | undefined;
    /**
     * Get AssetWithSource object from inputPath
     */
    getAssetWithSource(inputPath: string): IAssetWithSource | undefined;
    /**
     * Check asset exists
     */
    hasAsset(inputPath: string): boolean;
    /**
     * Add asset
     */
    addAsset(asset: IAsset): void;
    /**
     * Remove asset
     */
    removeAsset(input: string | IAsset): void;
    /**
     * Clear manifest
     */
    clearAssets(): void;
    /**
     * Get Source object
     */
    findSource(inputPath: string): import("./source").Source | undefined;
    /**
     * Get IAsset object from output
     */
    findAssetFromOutput(outputPath: string): IAsset | undefined;
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
