import { RuleBuilder, DefaultRule } from "./types";
export declare function createRule<Options, Methods>(desc: RuleBuilder<Options, Methods>): (pattern: string) => DefaultRule<Options> & Methods;
