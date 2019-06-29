import { FilePipeline } from "./file-pipeline";
import { IDirectoryRule } from "./types";
export declare class DirectoryPipeline extends FilePipeline {
    type: string;
    add(glob: string, parameters?: IDirectoryRule): void;
    addEntry(input: string, output: string, parameters?: IDirectoryRule): void;
    fetch(): void;
}
