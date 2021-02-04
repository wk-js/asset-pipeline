import { PathBuilder, URLBuilder } from "./path";
import { ResolvedPath, TransformedEntry } from "./types";
export declare class Resolver {
    host: URLBuilder;
    output: PathBuilder;
    protected _paths: TransformedEntry[];
    protected _aliases: PathBuilder[];
    set(paths: TransformedEntry[]): void;
    alias(path: string): this;
    resolve(path: string): ResolvedPath[];
    getTransformedPath(path: string): import("./types").TransformedPath;
    getPath(path: string): string;
    getUrl(path: string): string;
    getOutputPath(path: string): string;
    filter(predicate?: (value: TransformedEntry, index: number, array: TransformedEntry[]) => boolean): TransformedEntry[];
}
