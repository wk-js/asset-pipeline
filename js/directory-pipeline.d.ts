import { GlobItem } from "./asset-pipeline";
import { FilePipeline } from "./file-pipeline";
export declare class DirectoryPipeline extends FilePipeline {
    fetch(): void;
    getRules(dir: string): GlobItem;
}
