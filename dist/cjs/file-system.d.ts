import { Dispatcher } from "lol/js/dispatcher";
export interface IManagerRuleItem {
    glob: string;
    action: "move" | "copy" | "symlink" | "ignore";
}
export declare class FileSystem {
    private pid;
    private sid;
    chunkCount: number;
    onNewFilesCopied: Dispatcher<[string, string][]>;
    private globs;
    private mtimes;
    constructor(pid: string, sid: string);
    private get pipeline();
    /**
     * Register a path or a glob pattern for a move
     */
    move(glob: string): void;
    /**
     * Register a path or a glob pattern for a copy
     */
    copy(glob: string): void;
    /**
     * Register a path or a glob pattern for a symlink
     */
    symlink(glob: string): void;
    /**
     * Register a path or a glob pattern to ignore
     */
    ignore(glob: string): void;
    /**
     * Clone FileSystem
     */
    clone(fs: FileSystem): FileSystem;
    /**
     * Perform move/copy/symlink
     */
    apply(force?: boolean): Promise<void>;
    protected _apply(type: string): Promise<void>;
    private _log;
}
