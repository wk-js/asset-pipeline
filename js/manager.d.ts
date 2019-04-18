/// <reference types="when" />
import { AssetPipeline } from "./asset-pipeline";
export declare class Manager {
    pipeline: AssetPipeline;
    globs: any[];
    constructor(pipeline: AssetPipeline);
    move(glob: string): void;
    copy(glob: string): void;
    symlink(glob: string): void;
    ignore(glob: string): void;
    process(): When.Promise<null>;
    apply(type: string): When.Promise<any>;
}
