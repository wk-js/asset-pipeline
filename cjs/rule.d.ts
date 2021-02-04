import { Rule, RuleOptions, TransformedPath } from "./types";
export declare class RuleBuilder {
    pattern: string;
    rule: Rule;
    constructor(pattern: string);
    path(path: string): this;
    name(name: string): this;
    extension(extension: string): this;
    directory(directory: string): this;
    baseDirectory(baseDirectory: string): this;
    relative(relative: string): this;
    keepDirectory(enable: boolean): this;
    cachebreak(enable: boolean): this;
    priority(value: number): this;
    tag(tag: string): this;
    match(filename: string): boolean;
    apply(filename: string, options?: Partial<RuleOptions>): TransformedPath;
}
