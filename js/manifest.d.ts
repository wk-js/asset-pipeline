import { Pipeline } from "./pipeline";
import { IAsset, IOutput } from "./types";
export declare class Manifest {
    private pipeline;
    private _file;
    read: boolean;
    save: boolean;
    constructor(pipeline: Pipeline);
    clone(manifest: Manifest): void;
    readonly manifest_path: string;
    fileExists(): boolean;
    create_file(): Promise<void>;
    update_file(): Promise<void>;
    read_file(): Promise<void>;
    delete_file(): Promise<void>;
    get(input: string): IAsset | null;
    has(input: string): boolean;
    set(asset: IAsset): void;
    all(tag?: string): IAsset[];
    all_by_key(tag?: string): Record<string, IAsset>;
    all_outputs(tag?: string): IOutput[];
    all_outputs_by_key(tag?: string): Record<string, IOutput>;
}
