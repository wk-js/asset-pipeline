import { Pipeline } from "./pipeline";
export declare class SourceManager {
    private pipeline;
    private _sources;
    constructor(pipeline: Pipeline);
    add(path: string): void;
    has(path: string): boolean;
    remove(path: string): void;
    source_with(source: string, input: string, is_absolute?: boolean): string;
    all(is_absolute?: boolean): string[];
    find_from(input: string, is_absolute?: boolean): string | null;
    forEach<T>(items: T[], cb: (item: T, source: string) => void): void;
    map<T, S>(items: T[], cb: (item: T, source: string) => S): S[];
    filter<T>(items: T[], cb: (item: T, source: string) => boolean): T[];
    filter_and_map<T, S>(items: T[], cb: (item: T, source: string) => S | boolean): S[];
}
