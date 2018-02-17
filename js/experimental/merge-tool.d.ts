import { AssetPipeline, AssetItemRules } from "../asset-pipeline";
export declare class MergeTool {
    static fetch_data(...pipelines: AssetPipeline[]): {};
    static fetch_assets(...pipelines: AssetPipeline[]): {};
    static fetch_rules(...pipelines: AssetPipeline[]): {
        file: AssetItemRules[];
        directory: AssetItemRules[];
    };
}
