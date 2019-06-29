import { Pipeline } from "./pipeline";
import { IManifest } from "./types";
export declare class Manifest {
    private pipeline;
    manifest: IManifest;
    read: boolean;
    save: boolean;
    constructor(pipeline: Pipeline);
    readonly manifest_path: string;
    readonly hash_key: string | number;
    readonly load_paths: import("./file-matcher").FileMatcher;
    fileExists(): boolean;
    createFile(): Promise<void>;
    updateFile(): Promise<void>;
    readFile(): Promise<void>;
    deleteFile(): Promise<void>;
}
