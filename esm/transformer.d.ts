import { PathOrString } from "./path/path";
import { TransformRule } from "./transform-rule";
import { RuleOptions, TransformResult } from "./types";
export declare class Transformer {
    saltKey: string;
    cachebreak: boolean;
    rules: TransformRule[];
    results: TransformResult[];
    add(pattern: PathOrString): import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions> & {
        name(name: string): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        directory(directory: string): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        baseDirectory(baseDirectory: string): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        relative(relative: string): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        cachebreak(enable: boolean): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        path(path: string): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        extension(extension: string): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        keepDirectory(enable: boolean): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        apply(filename: string, options?: Partial<RuleOptions> | undefined): import("./types").TransformedPath;
    };
    delete(pattern: PathOrString): void;
    transform(files: string[]): TransformResult[];
}
