export interface IManagerRuleItem {
    glob: string;
    action: "move" | "copy" | "symlink" | "ignore";
}
export declare class FileSystem {
    private pid;
    private sid;
    chunkCount: number;
    private globs;
    private mtimes;
    constructor(pid: string, sid: string);
    get source(): import("./source").Source | undefined;
    get resolver(): import("./resolver").Resolver | undefined;
    move(glob: string): void;
    copy(glob: string): void;
    symlink(glob: string): void;
    ignore(glob: string): void;
    clone(fs: FileSystem): FileSystem;
    apply(force?: boolean): Promise<void>;
    protected _apply(type: string): Promise<void>;
    private _log;
}
