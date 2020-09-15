import { Manifest } from "./manifest";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { PathBuilder, URLBuilder } from "./path";
import { IResolvePathOptions } from "./types";
export declare const PipelineManager: Map<string, Pipeline>;
export declare class Pipeline {
    uuid: string;
    cache: any;
    verbose: any;
    output: PathBuilder;
    host: URLBuilder;
    cwd: PathBuilder;
    source: SourceManager;
    manifest: Manifest;
    resolver: Resolver;
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
     * Get Source object
     */
    getSource(inputPath: string): import("./source").Source | undefined;
    /**
     * Get IAsset object
     */
    getAsset(inputPath: string): import("./types").IAsset | undefined;
    /**
     * Get path
     */
    getPath(inputPath: string, options?: Partial<IResolvePathOptions>): string;
    /**
     * Get url
     */
    getUrl(inputPath: string, options?: Partial<IResolvePathOptions>): string;
    /**
     * Get IAsset object from output
     */
    getAssetFromOutput(outputPath: string): import("./types").IAsset | undefined;
}
