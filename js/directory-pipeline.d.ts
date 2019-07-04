import { FilePipeline } from "./file-pipeline";
import { IDirectoryRule } from "./types";
import { Pipeline } from "./pipeline";
export declare class DirectoryPipeline extends FilePipeline {
    constructor(pipeline: Pipeline);
    add(glob: string, parameters?: IDirectoryRule): void;
    addEntry(input: string, output: string, parameters?: IDirectoryRule): void;
    clone(dir: DirectoryPipeline): DirectoryPipeline;
    fetch(): void;
}
