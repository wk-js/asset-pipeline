import { IShadowRule } from "./types";
export declare class ShadowPipeline {
    private pid;
    protected _rules2: Record<string, IShadowRule>;
    constructor(pid: string);
    private get pipeline();
    /**
     * Add a file to the manifest without resolving
     */
    addFile(inputPath: string, transformRule?: Pick<IShadowRule, "output" | "cache" | "tag">): this;
    /**
     * Add a directory to the manifest without resolving
     */
    addDirectory(inputPath: string, transformRule?: Pick<IShadowRule, "output" | "cache" | "tag">): this;
    private _add;
    fetch(): void[];
}
