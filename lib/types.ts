import { EmitterCallback, EmitterEvent } from "lol/js/emitter"
import { Pipeline } from "./pipeline"

export interface Rule {
  name?: string
  extension?: string
  directory?: string
  baseDirectory?: string
  relative?: string

  tag: string
  priority: number
  cachebreak: boolean
}

export interface RuleOptions {
  cachebreak: boolean
  saltKey: string
}

export interface TransformedPath {
  path: string
  tag: string
  priority: number
}

export type TransformedEntry = [string, TransformedPath]

export interface ResolvedPath {
  transformed: TransformedPath
  parameters: string
}

export interface PipelineEvents {
  "resolved": string[]
  "transformed": TransformedEntry[]
}

export type PipelineEvent<K extends keyof PipelineEvents=any> = EmitterEvent<K, PipelineEvents[K]>
export type PipelineEventCallback<K extends keyof PipelineEvents=any> = EmitterCallback<K, PipelineEvents[K]>

export interface PipelinePlugin {
  name: string
  setup(pipeline: Pipeline): any | Promise<any>
}