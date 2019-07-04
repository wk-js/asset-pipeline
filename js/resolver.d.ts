import { Pipeline } from "./pipeline";
import { IPathObject, IAsset } from "./types";
export declare class Resolver {
    private pipeline;
    private _output;
    private _used;
    private _root;
    host: string;
    constructor(pipeline: Pipeline);
    clone(resolve: Resolver): void;
    root(path?: string): string;
    root_with(path: string): string;
    output(path?: string): string;
    output_with(path: string, absolute?: boolean): string;
    path(path: string, from?: string): string;
    url(path: string, from?: string): string;
    clean_path(path: string, fromPath?: string): string;
    clean_url(path: string, fromPath?: string): string;
    asset(input: string): IAsset | null;
    source(output: string, is_absolute?: boolean, normalize?: boolean): string;
    parse(path: string): IPathObject;
    relative(from: string, to: string): string;
    normalize(path: string): string;
    use(path: string): void;
    is_used(path: string): boolean;
    clean_used(): void;
    all_used(): string[];
}
