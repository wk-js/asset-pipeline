import { Pipeline } from './pipeline';
import { IMatchRule, IAsset } from './types';
export declare class FileMatcher {
    private pipeline;
    private load_paths;
    constructor(pipeline: Pipeline);
    readonly root_path: string;
    add(path: string): void;
    has(path: string): boolean;
    remove(path: string): void;
    getPaths(): string[];
    getAbsoluteLoadPath(load_path: string): string;
    fromLoadPath(load_path: string, path: string): string;
    relativeToLoadPath(load_path: string, path: string): string;
    findLoadPath(path: string): string | null;
    fetch(rules: IMatchRule[], type?: "file" | "directory"): IAsset[];
    fetchDirs(rules: IMatchRule[]): IAsset[];
    _fetcher(type?: "file" | "directory"): (globs: string[], ignores: string[]) => string[];
    forEach<T>(items: T[], cb: (item: T, load_path: string) => void): void;
    map<T, S>(items: T[], cb: (item: T, load_path: string) => S): S[];
    filter<T>(items: T[], cb: (item: T, load_path: string) => boolean): T[];
    filterAndMap<T, S>(items: T[], cb: (item: T, load_path: string) => S | boolean): S[];
}
