import { Pipeline } from "./pipeline";
interface IManagerRuleItem {
    glob: string;
    action: "move" | "copy" | "symlink" | "ignore";
}
export declare class FileSystem {
    private pipeline;
    globs: IManagerRuleItem[];
    constructor(pipeline: Pipeline);
    readonly load_paths: import("./file-matcher").FileMatcher;
    readonly resolver: import("./path-resolver").PathResolver;
    move(glob: string): void;
    copy(glob: string): void;
    symlink(glob: string): void;
    ignore(glob: string): void;
    apply(): Promise<void>;
    _apply(type: string): Promise<void>;
}
export {};
