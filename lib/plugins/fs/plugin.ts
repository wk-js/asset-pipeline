import "./types"
import { PipelinePlugin } from "../../types";
import { FileSystem } from "./file-system";

export const FsPlugin = <PipelinePlugin>{
  name: "fs",
  setup(pipeline) {
    return new FileSystem(pipeline)
  }
}