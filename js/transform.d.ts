import { Pipeline } from "./pipeline";
import { IFileRule, IAsset, IMatchRule } from "./types";
export declare class Transform {
    type: string;
    protected rules: IMatchRule[];
    constructor(type?: string);
    /**
     * Add as transformation applied to the glob pattern
     */
    add(glob: string, parameters?: IFileRule): void;
    /**
     * Shortcut for input/output transformation
     */
    addEntry(input: string, output: string, parameters?: IFileRule): void;
    /**
     * Add as transformation applied to the glob pattern
     */
    ignore(glob: string): void;
    /**
     * Clone the rules
     */
    clone(file: Transform): Transform;
    /**
     * Look for the first matching rule. If not found, a generic rule is returned.
     */
    matchingRule(path: string): IMatchRule;
    /**
     * Apply the transformation to the asset and register to the manifest
     */
    resolve(pipeline: Pipeline, asset: IAsset): void;
    protected resolveOutput(pipeline: Pipeline, file: string, rule: IMatchRule): void;
}
