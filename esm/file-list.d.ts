import { FileList as FList } from "filelist";
import { PathBuilder } from "./path";
export declare class FileList {
    lazy: boolean;
    entries: string[];
    protected filelist: FList;
    include(...patterns: (string | PathBuilder)[]): this;
    exclude(...patterns: (string | PathBuilder)[]): this;
    shadow(...patterns: (string | PathBuilder)[]): this;
    resolve(force?: boolean): string[];
    protected _toOSPath(pattern: string | PathBuilder): string;
    protected _push(file: string): void;
    protected _include(pattern: string): void;
    protected _exclude(pattern: string): void;
}
