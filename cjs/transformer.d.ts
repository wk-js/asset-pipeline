import { PathOrString } from "./path/path";
import { TransformRule } from "./transform-rule";
import { TransformResult } from "./types";
export declare class Transformer {
    saltKey: string;
    cachebreak: boolean;
    entries: TransformRule[];
    results: TransformResult[];
    add(pattern: PathOrString): TransformRule;
    delete(pattern: PathOrString): void;
    transform(files: string[]): TransformResult[];
}
