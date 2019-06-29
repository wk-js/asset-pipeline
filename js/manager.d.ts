import { AssetPipeline } from "./asset-pipeline";
interface IManagerRuleItem {
    glob: string;
    action: "move" | "copy" | "symlink" | "ignore";
}
export declare class Manager {
    pipeline: AssetPipeline;
    globs: IManagerRuleItem[];
    constructor(pipeline: AssetPipeline);
    move(glob: string): void;
    copy(glob: string): void;
    symlink(glob: string): void;
    ignore(glob: string): void;
    process(): Promise<void>;
    apply(type: string): Promise<void>;
}
export {};
