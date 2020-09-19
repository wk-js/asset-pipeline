/// <reference types="node" />
import { ParsedPath } from "path";
import { Source } from "./source";
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
export declare type TRenameObject = ParsedPath & {
    hash: string;
};
export interface IMinimumRule {
    ignore?: boolean;
    cache?: boolean | string | TRenameFunction | Partial<TRenameObject>;
    output?: string | TRenameFunction | Partial<TRenameObject>;
    tag?: string;
}
export interface IFileRule extends IMinimumRule {
    keepPath?: boolean;
    baseDir?: string;
}
export interface IDirectoryRule extends IFileRule {
    fileRules?: (IMinimumRule & {
        glob?: string;
    })[];
}
export declare type IShadowRule = IMatchRule & {
    type: "file" | "directory";
};
export interface IMatchRule extends IFileRule {
    glob: string;
}
export interface IAsset {
    source: {
        uuid: string;
        path: string;
    };
    input: string;
    output: string;
    tag: string;
    type: "file" | "directory";
    resolved?: boolean;
    rule?: IFileRule | IDirectoryRule;
}
export declare type IAssetWithSource = Omit<IAsset, "source"> & {
    source: Source;
};
export interface IManifest {
    key: string | number;
    date: Date;
    sources: string[];
    output: string;
    assets: Record<string, IAsset | undefined>;
}
export interface IPathObject {
    relative: string;
    full?: string;
    source?: string;
    key?: string;
}
export interface IOutput {
    input: string;
    type: "file" | "directory";
    output: {
        path: string;
        url: string;
    };
}
export interface IResolvePathOptions {
    from: string;
    cleanup: boolean;
}
