import { AssetPipeline } from "./asset-pipeline";
export declare class Manager {
    pipeline: AssetPipeline;
    globs: any[];
    constructor(pipeline: AssetPipeline);
    move(glob: string): void;
    copy(glob: string): void;
    symlink(glob: string): void;
    ignore(glob: string): void;
    process(): Promise<void>;
    apply(type: string): Promise<void>;
}
