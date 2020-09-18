import { Pipeline } from "./pipeline";
import { IAsset, IMatchRule } from "./types";
/**
 * Apply output/cache transformation to the asset input
 */
export declare function transform(pipeline: Pipeline, asset: IAsset, rules: IMatchRule[]): IAsset;
