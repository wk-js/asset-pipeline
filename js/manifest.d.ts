import { IAsset, IOutput } from "./types";
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
    export(type?: "asset", tag?: string): IAsset[];
    export(type: "asset_key", tag?: string): Record<string, IAsset>;
    export(type: "output", tag?: string): IOutput[];
    export(type: "output_key", tag?: string): Record<string, IOutput>;
}
