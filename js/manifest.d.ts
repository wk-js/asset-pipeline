import { IAsset, IOutput, IAssetWithSource } from "./types";
export declare class Manifest {
    private pid;
    private _file;
    readOnDisk: boolean;
    saveOnDisk: boolean;
    saveAtChange: boolean;
    constructor(pid: string);
    get pipeline(): import("./pipeline").Pipeline | undefined;
    clone(manifest: Manifest): void;
    get manifest_path(): string;
    fileExists(): boolean;
    save(): void;
    read(): void;
    deleteOnDisk(): void;
    get(input: string): IAsset | undefined;
    has(input: string): boolean;
    add(asset: IAsset): void;
    remove(input: string | IAsset): void;
    clear(): void;
    export(exportType?: "asset", tag?: string): IAsset[];
    export(exportType: "asset_key", tag?: string): Record<string, IAsset>;
    export(exportType: "asset_source", tag?: string): IAssetWithSource[];
    export(exportType: "asset_source_key", tag?: string): Record<string, IAssetWithSource>;
    export(exportType: "output", tag?: string): IOutput[];
    export(exportType: "output_key", tag?: string): Record<string, IOutput>;
}
