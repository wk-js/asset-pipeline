import { RuleBuilder, DefaultRule } from "./types";
export declare function createRule<Data, Methods>(desc: RuleBuilder<Data, Methods>): (pattern: string) => DefaultRule<Data> & Methods;
