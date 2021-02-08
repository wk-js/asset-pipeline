import { EmitterCallback, EmitterEvent } from "lol/js/emitter";
import { Pipeline } from "./pipeline";
export interface RuleOptions {
    cachebreak: boolean;
    saltKey: string;
}
export interface DefaultRule<Options extends Record<string, any>> {
    pattern: string;
    options: Options & {
        tag: string;
        priority: number;
    };
    tag(tag: string): this;
    priority(priority: number): this;
    set(override: Partial<this['options']>): this;
    match(filename: string): boolean;
}
export interface RuleBuilder<Options, Methods> {
    options?: () => Options;
    methods?: Methods & ThisType<Methods & DefaultRule<Options>>;
}
export interface TransformedPath {
    path: string;
    tag: string;
    priority: number;
}
export declare type TransformResult = [string, TransformedPath];
export interface ResolvedPath {
    transformed: TransformedPath;
    parameters: string;
}
export interface PipelineEvents {
    "resolved": string[];
    "transformed": TransformResult[];
}
export declare type PipelineEvent<K extends keyof PipelineEvents = any> = EmitterEvent<K, PipelineEvents[K]>;
export declare type PipelineEventCallback<K extends keyof PipelineEvents = any> = EmitterCallback<K, PipelineEvents[K]>;
export interface PipelinePlugin {
    name: string;
    setup(pipeline: Pipeline): any | Promise<any>;
}
