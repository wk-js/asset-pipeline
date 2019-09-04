import { Transform } from "./transform";
import { Pipeline } from "./pipeline";

type TRenameFunction = (output: string, file: string, rules: IMatchRule) => string

export interface IMinimumRule {
  // Ignore matched files
  ignore?: boolean,

  // Cachebreak mateched files
  cache?: boolean,

  // Rename the basename or accept a function to rename full output path
  rename?: string | TRenameFunction,

  // Tagname
  tag?: string
}

export interface IFileRule extends IMinimumRule {
  // Remove dir_path, keep basename only
  keep_path?: boolean,

  // Add a base directory
  base_dir?: string,
}

export interface IDirectoryRule extends IFileRule {
  file_rules?: (IMinimumRule & { glob?: string })[]
}

export interface IMatchRule extends IFileRule {
  glob: string
}

export interface IAsset {
  source: string,
  input: string,
  output: string,
  cache: string,
  tag: string,
  resolved?: boolean,
  rule?: IFileRule | IDirectoryRule
}

export interface IManifest {
  key: string | number,
  date: Date,
  sources: string[],
  output: string,
  root: string,
  assets: Record<string, IAsset>
}

export interface IPathObject {
  relative: string,
  full: string,
  source?: string,
  key?: string
}

export interface IOutput {
  input: string,
  output: {
    path: string,
    url: string,
  }
}

export interface IPipeline {
  type: "file" | "directory"
  rules: Transform
  fetch(pipeline: Pipeline) : void
}