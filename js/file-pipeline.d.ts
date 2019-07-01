import { Pipeline } from "./pipeline";
import { IFileRule, IAsset, IMatchRule } from "./types";
export declare class FilePipeline {
    pipeline: Pipeline;
    rules: IMatchRule[];
    type: "file" | "directory";
    constructor(pipeline: Pipeline);
    add(glob: string, parameters?: IFileRule): void;
    addEntry(input: string, output: string, parameters?: IFileRule): void;
    ignore(glob: string): void;
    fetch(): void;
    _fetch(): IAsset[];
    private _fetcher;
    findRule(path: string): IMatchRule;
    resolve(asset: IAsset): void;
    resolveOutput(file: string, rule: IMatchRule): void;
}
