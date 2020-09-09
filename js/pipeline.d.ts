import { Manifest } from "./manifest";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { Cache } from "./cache";
import { PathBuilder, URLBuilder } from "./path";
import { IResolvePathOptions } from "./types";
export declare const PipelineManager: Map<string, Pipeline>;
export declare class Pipeline {
    uuid: string;
    verbose: boolean;
    output: PathBuilder;
    host: URLBuilder;
    cwd: PathBuilder;
    cache: Cache;
    source: SourceManager;
    manifest: Manifest;
    resolver: Resolver;
    constructor(key: string);
    clone(key: string): Pipeline;
    fetch(force?: boolean): void;
    copy(): Promise<void>;
    log(...args: any[]): void;
    /**
     * Looking for source from a path by checking base directory
     */
    getSource(inputPath: string): import("./source").Source | undefined;
    /**
     * Looking for a source and
     */
    getAsset(inputPath: string): import("./types").IAsset | undefined;
    getPath(inputPath: string, options?: Partial<IResolvePathOptions>): string;
    getUrl(inputPath: string, options?: Partial<IResolvePathOptions>): string | URL;
    getAssetFromOutput(outputPath: string): import("./types").IAsset | undefined;
}
