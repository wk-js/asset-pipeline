import { ParsedPath } from "path";
import { Source } from "./source";

export interface RenameOptions {
  input: {
    fullpath: string,
    root: string,
    dir: string,
    base: string,
    ext: string,
    name: string,
    hash: string
  },
  output: {
    fullpath: string,
    root: string,
    dir: string,
    base: string,
    ext: string,
    name: string,
    hash: string
  },
  rule: IMatchRule
}

export type TRenameFunction = (options: RenameOptions) => string

export type TRenameObject = Partial<ParsedPath>

export interface IMinimumRule {
  // Ignore matched files
  ignore?: boolean,

  // Cachebreak mateched files
  cache?: boolean | string | TRenameFunction | TRenameObject,

  // Rename the basename or accept a function to rename full output path
  output?: string | TRenameFunction | TRenameObject,

  // Tagname
  tag?: string
}

export interface IFileRule extends IMinimumRule {
  // Remove dir_path, keep basename only
  keepPath?: boolean,

  // Add a base directory
  baseDir?: string,
}

export interface IDirectoryRule extends IFileRule {
  fileRules?: (IMinimumRule & { glob?: string })[]
}

export type IShadowRule = IMatchRule & { type: "file" | "directory" }

export interface IMatchRule extends IFileRule {
  glob: string
}

export interface IAsset {
  source: {
    uuid: string,
    path: string
  },
  input: string,
  output: string,
  cache: string,
  tag: string,
  type: "file" | "directory",
  resolved?: boolean,
  rule?: IFileRule | IDirectoryRule
}

export type IAssetWithSource = Omit<IAsset, "source"> & {
  source: Source
}

export interface IManifest {
  key: string | number,
  date: Date,
  sources: string[],
  output: string,
  assets: Record<string, IAsset | undefined>
}

export interface IPathObject {
  relative: string,
  full?: string,
  source?: string,
  key?: string
}

export interface IOutput {
  input: string,
  type: "file" | "directory",
  output: {
    path: string,
    url: string,
  }
}

export interface IResolvePathOptions {
  // Set relative path
  from: string

  // Remove hash and search parameters
  cleanup: boolean
}