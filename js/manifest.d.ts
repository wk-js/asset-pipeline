import { Pipeline } from "./pipeline";
import { IAsset, IManifest } from "./types";
export declare class Manifest {
    private pipeline;
    read_file: IManifest;
    read: boolean;
    save: boolean;
    constructor(pipeline: Pipeline);
    readonly manifest_path: string;
    fileExists(): boolean;
    create_file(): Promise<void>;
    update_file(): Promise<void>;
    readFile(): Promise<void>;
    delete_file(): Promise<void>;
    get(input: string): IAsset | null;
    has(input: string): boolean;
    set(asset: IAsset): void;
    all(): IAsset[];
}
