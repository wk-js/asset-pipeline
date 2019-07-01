import { Pipeline } from "./pipeline";
export declare class Resolver {
    private pipeline;
    private _output;
    private _used;
    private _root;
    host: string;
    constructor(pipeline: Pipeline);
    root: string;
    output: string;
    output_with(path: string): string;
    relative(from: string, to: string): string;
    path(path: string, from?: string): string;
    url(path: string, from?: string): string;
    clean_path(path: string, fromPath?: string): string;
    clean_url(path: string, fromPath?: string): string;
    asset(input: string): import("./types").IAsset | null;
    source(output: string, is_absolute?: boolean): string;
    use(path: string): void;
    is_used(path: string): boolean;
    clean_used(): void;
    all_used(): string[];
}
