import { AssetPipeline, AssetItemRules } from '../asset-pipeline';
export declare class AssetPipelineShared {
    pipelines: AssetPipeline[];
    rules: {
        file: AssetItemRules[];
        directory: AssetItemRules[];
    };
    assets: any;
    data: any;
    update(): void;
    fromLoadPath(path: string): string;
    fromDstPath(path: string): string;
    relativeToLoadPath(path: string): string;
    getPath(path: string): string;
    getFileRules(file: string): {};
    getDirectoryRules(dir: string): AssetItemRules;
}
