import { PathBuilder } from "../../path";
import { Pipeline } from "../../pipeline";
import { ManifestFile } from "./types";
export declare class Manifest {
    protected pipeline: Pipeline;
    saveOnDisk: boolean;
    path: PathBuilder;
    file: ManifestFile;
    constructor(pipeline: Pipeline);
    set(content: ManifestFile): void;
    /**
     * Check if manifest file is created
     */
    exists(): boolean;
    /**
     * Save manifest file
     */
    save(): void;
    /**
     * Read manifest file
     */
    read(): void;
    /**
     * Remove manifest file
     */
    delete(): void;
}
