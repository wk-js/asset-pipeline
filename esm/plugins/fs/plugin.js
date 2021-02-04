import "./types";
import { FileSystem } from "./file-system";
export const FsPlugin = {
    name: "fs",
    setup(pipeline) {
        return new FileSystem(pipeline);
    }
};
