import { RuleOptions, TransformedPath } from "./types";
export interface TransformRuleOptions {
    name?: string;
    extension?: string;
    directory?: string;
    baseDirectory?: string;
    relative?: string;
    cachebreak: boolean;
}
export declare type TransformRule = ReturnType<typeof CreateTransformRule>;
export declare const CreateTransformRule: (pattern: string) => import("./types").DefaultRule<TransformRuleOptions> & {
    name(name: string): any & import("./types").DefaultRule<TransformRuleOptions>;
    directory(directory: string): any & import("./types").DefaultRule<TransformRuleOptions>;
    baseDirectory(baseDirectory: string): any & import("./types").DefaultRule<TransformRuleOptions>;
    relative(relative: string): any & import("./types").DefaultRule<TransformRuleOptions>;
    cachebreak(enable: boolean): any & import("./types").DefaultRule<TransformRuleOptions>;
    path(path: string): any & import("./types").DefaultRule<TransformRuleOptions>;
    extension(extension: string): any & import("./types").DefaultRule<TransformRuleOptions>;
    keepDirectory(enable: boolean): any & import("./types").DefaultRule<TransformRuleOptions>;
    apply(filename: string, options?: Partial<RuleOptions> | undefined): TransformedPath;
};
