import { Manifest } from "./manifest";
import { Tree } from "./tree";
import { Resolver } from "./resolver";
import { SourceMap } from "./source";
import { Cache } from "./cache";
export declare class Pipeline {
    verbose: boolean;
    cache: Cache;
    source: SourceMap;
    manifest: Manifest;
    resolve: Resolver;
    tree: Tree;
    constructor(key: string);
    clone(key: string): Pipeline;
    fetch(force?: boolean): Promise<void>;
    copy(): Promise<void>;
    log(...args: any[]): void;
}
