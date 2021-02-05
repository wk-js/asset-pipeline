import "./types";
import { FileSystem } from "./file-system";
export const FsPlugin = {
    name: "fs",
    setup(pipeline) {
        pipeline.options("fs", new FileSystem(pipeline));
    }
};
