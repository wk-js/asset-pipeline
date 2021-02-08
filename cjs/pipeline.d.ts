import { FileList } from "./file-list";
import { Resolver } from "./resolver";
import { PathBuilder, PathOrString } from "./path/path";
import { Transformer } from "./transformer";
import { Emitter } from "lol/js/emitter";
import { PipelineEvents, PipelinePlugin } from "./types";
export declare class Pipeline {
    files: FileList;
    rules: Transformer;
    resolver: Resolver;
    events: Emitter<PipelineEvents>;
    protected _plugins: Set<string>;
    protected _options: Map<string, any>;
    get logging(): boolean;
    set logging(value: boolean);
    createPath(path: string): PathBuilder;
    fetch(forceResolve?: boolean): void;
    append(files: PathOrString[]): void;
    plugin(plugin: PipelinePlugin): Promise<void>;
}
