import { FileSystem } from "./file-system";
export interface FSRuleEntry {
    glob: string;
    action: "move" | "copy" | "symlink" | "ignore";
}
declare module "../../pipeline" {
    interface Pipeline {
        options(id: "fs", value?: FileSystem): FileSystem;
    }
}
declare module "../../types" {
    interface PipelineEvents {
        "newfilecopied": [string, string][];
    }
}
