import { Manifest } from "./manifest";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { Cache } from "./cache";
import { PathBuilder, URLBuilder } from "./path";
import { IResolvePathOptions } from "./types";
import { ShadowPipeline } from "./shadow-pipeline";
export declare const PipelineManager: Map<string, Pipeline>;
export declare class Pipeline {
    uuid: string;
    cache: Cache;
    verbose: boolean;
    output: PathBuilder;
    host: URLBuilder;
    cwd: PathBuilder;
    source: SourceManager;
    manifest: Manifest;
    resolver: Resolver;
    shadow: ShadowPipeline;
    constructor(key: string);
    /**
     * Clone pipeline
     */
    clone(key: string): Pipeline;
    /**
     * Fetch directories, files, update tree and update manifest
     */
    fetch(force?: boolean): void;
    /**
     * Perform copy/move/symlink
     */
    copy(): Promise<void>;
    /**
     * Logger
     */
    log(...args: any[]): void;
    /**
     * Get path
     */
    getPath(inputPath: string, options?: Partial<IResolvePathOptions>): string;
    /**
     * Get url
     */
    getUrl(inputPath: string, options?: Partial<IResolvePathOptions>): string;
}
