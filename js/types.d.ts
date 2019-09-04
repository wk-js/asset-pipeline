import { Transform } from "./transform";
import { Pipeline } from "./pipeline";
declare type TRenameFunction = (output: string, file: string, rules: IMatchRule) => string;
export interface IMinimumRule {
    ignore?: boolean;
    cache?: boolean;
    rename?: string | TRenameFunction;
}
export interface IFileRule extends IMinimumRule {
    keep_path?: boolean;
    base_dir?: string;
}
export interface IDirectoryRule extends IFileRule {
    file_rules?: (IMinimumRule & {
        glob?: string;
    })[];
}
export interface IMatchRule extends IFileRule {
    glob: string;
}
export interface IAsset {
    source: string;
    input: string;
    output: string;
    cache: string;
    resolved?: boolean;
    rule?: IFileRule | IDirectoryRule;
}
export interface IManifest {
    key: string | number;
    date: Date;
    sources: string[];
    output: string;
    root: string;
    assets: Record<string, IAsset>;
}
export interface IPathObject {
    relative: string;
    full: string;
    source?: string;
    key?: string;
}
export interface IOutput {
    input: string;
    output: {
        path: string;
        url: string;
    };
}
export interface IPipeline {
    type: "file" | "directory";
    rules: Transform;
    fetch(pipeline: Pipeline): void;
}
export {};
