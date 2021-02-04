import "./types";
import { Pipeline } from "../../pipeline";
import { Emitter } from "lol/js/emitter";
import { PipelineEvents } from "../../types";
import { Resolver } from "../../resolver";
export declare class FileSystem {
    chunkCount: number;
    private mtimes;
    private globs;
    resolver: Resolver;
    events: Emitter<PipelineEvents>;
    constructor(pipeline: Pipeline);
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
     * Perform move/copy/symlink
     */
    apply(force?: boolean): Promise<void>;
    protected _apply(type: string): Promise<void>;
}
