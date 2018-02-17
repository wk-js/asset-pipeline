import { AssetPipeline, AssetItemRules } from "./asset-pipeline";
import { ManifestFile } from "./manifest";
export declare class FilePipeline {
    pipeline: AssetPipeline;
    rules: AssetItemRules[];
    constructor(pipeline: AssetPipeline);
    readonly manifest: ManifestFile;
    add(glob: string, parameters?: AssetItemRules): void;
    ignore(glob: string): void;
    fetch(): void;
    getRules(file: string): {};
    resolve(file: string): void;
    resolveOutput(file: string, rules: AssetItemRules, isAlternative?: boolean): void;
}
