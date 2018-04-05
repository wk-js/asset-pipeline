import { AssetItemRules } from "./asset-pipeline";
import { FilePipeline } from "./file-pipeline";
export declare class DirectoryPipeline extends FilePipeline {
    type: string;
    fetch(): void;
    getRules(dir: string): AssetItemRules;
}
