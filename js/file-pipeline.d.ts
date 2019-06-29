import { AssetPipeline, AssetItemRules, Rules } from "./asset-pipeline";
export declare class FilePipeline {
    pipeline: AssetPipeline;
    rules: AssetItemRules[];
    type: string;
    constructor(pipeline: AssetPipeline);
    readonly manifest: import("./manifest").ManifestFile;
    add(glob: string, parameters?: Rules): void;
    ignore(glob: string): void;
    fetch(): void;
    getRules(file: string): AssetItemRules;
    resolve(file: string): void;
    resolveOutput(file: string, rules: AssetItemRules): void;
}
