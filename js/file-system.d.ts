import { Pipeline } from "./pipeline";
export interface IManagerRuleItem {
    glob: string;
    action: "move" | "copy" | "symlink" | "ignore";
}
export declare class FileSystem {
    private _source;
    globs: IManagerRuleItem[];
    mtimes: Map<string, Date>;
    constructor(_source: string);
    move(glob: string): void;
    copy(glob: string): void;
    symlink(glob: string): void;
    ignore(glob: string): void;
    clone(fs: FileSystem): FileSystem;
    apply(pipeline: Pipeline, force?: boolean): Promise<void>;
    protected _apply(pipeline: Pipeline, type: string): Promise<void>;
}
