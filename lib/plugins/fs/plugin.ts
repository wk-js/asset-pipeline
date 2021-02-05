import "./types"
import { PipelinePlugin } from "../../types";
import { FileSystem } from "./file-system";

export const FsPlugin = <PipelinePlugin>{
  name: "fs",
  setup(pipeline) {
    pipeline.options("fs", new FileSystem(pipeline))
  }
}