import { Pipeline } from "./pipeline";
import { IAsset, IManifest } from "./types";
export declare class Manifest {
    private pipeline;
    file: IManifest;
    read: boolean;
    save: boolean;
    constructor(pipeline: Pipeline);
    readonly manifest_path: string;
    fileExists(): boolean;
    createFile(): Promise<void>;
    updateFile(): Promise<void>;
    readFile(): Promise<void>;
    deleteFile(): Promise<void>;
    get(input: string): IAsset | null;
    has(input: string): boolean;
    set(asset: IAsset): void;
    all(): IAsset[];
}
