import { Transform } from "./transform";
import { Pipeline } from "./pipeline";
export interface RenameOptions {
    input: {
        fullpath: string;
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
        hash: string;
    };
    output: {
        fullpath: string;
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
        hash: string;
    };
    rule: IMatchRule;
}
export declare type TRenameFunction = (options: RenameOptions) => string;
export interface IMinimumRule {
    ignore?: boolean;
    cache?: boolean | string | TRenameFunction;
    output?: string | TRenameFunction;
    tag?: string;
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
    tag: string;
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
