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
    load_path: string;
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
export {};
