import { Manifest } from "./manifest";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { Cache } from "./cache";
export declare const PipelineManager: Map<string, Pipeline>;
export declare class Pipeline {
    uuid: string;
    verbose: boolean;
    cache: Cache;
    resolve: Resolver;
    source: SourceManager;
    manifest: Manifest;
    tree: Tree;
    constructor(key: string);
    clone(key: string): Pipeline;
    fetch(force?: boolean): void;
    copy(): Promise<void>;
    log(...args: any[]): void;
}
