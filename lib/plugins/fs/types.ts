import { FileSystem } from "./file-system";
import { Pipeline } from "../../pipeline";
import { PipelineEvents } from "../../types";

export interface FSRuleEntry {
  glob: string,
  action: "move" | "copy" | "symlink" | "ignore"
}

declare module "../../pipeline" {
  interface Pipeline {
    // Declare fs options
    options(id: "fs"): FileSystem
  }
}

declare module "../../types" {
  interface PipelineEvents {
    // Declare new fs event
    "newfilecopied": [string, string][]
  }
}
