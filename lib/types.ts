import { EmitterCallback, EmitterEvent } from "lol/js/emitter"
import { Pipeline } from "./pipeline"

export interface RuleOptions {
  cachebreak: boolean
  saltKey: string
}

export interface DefaultRule<Options extends Record<string, any>> {
  pattern: string
  options: Options & {
    tag: string
    priority: number
  }
  clone(): this
  tag(tag: string): this
  priority(priority: number): this
  set(override: Partial<this['options']>): this
  match(filename: string): boolean
}

export interface RuleBuilder<Data, Methods> {
  options: Data
  api?: Methods & ThisType<Methods & DefaultRule<Data>>
}

export interface TransformedPath {
  path: string
  tag: string
  priority: number
}

export type TransformResult = [string, TransformedPath]

export interface ResolvedPath {
  transformed: TransformedPath
  parameters: string
}

export interface PipelineEvents {
  "resolved": string[]
  "transformed": TransformResult[]
}

export type PipelineEvent<K extends keyof PipelineEvents=any> = EmitterEvent<K, PipelineEvents[K]>
export type PipelineEventCallback<K extends keyof PipelineEvents=any> = EmitterCallback<K, PipelineEvents[K]>

export interface PipelinePlugin {
  name: string
  setup(pipeline: Pipeline): any | Promise<any>
}