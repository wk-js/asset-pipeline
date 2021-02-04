import { PathBuilder } from "./path";
import { RuleBuilder } from "./rule";
import { TransformedEntry } from "./types";
export declare class Transformer {
    saltKey: string;
    cachebreak: boolean;
    entries: RuleBuilder[];
    results: TransformedEntry[];
    add(pattern: string | PathBuilder): RuleBuilder;
    delete(pattern: string | PathBuilder): void;
    transform(files: string[]): TransformedEntry[];
    protected _toWebPath(pattern: string | PathBuilder): string;
}
