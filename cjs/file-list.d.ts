import { PathBuilder } from "./path";
export declare class FileList {
    entries: string[];
    protected filelist: {
        pending: boolean;
        include: string[];
        exclude: string[];
    };
    include(...patterns: (string | PathBuilder)[]): this;
    exclude(...patterns: (string | PathBuilder)[]): this;
    shadow(...patterns: (string | PathBuilder)[]): this;
    resolve(force?: boolean): string[];
    protected _toUnixPath(pattern: string | PathBuilder): string;
    protected _push(file: string): void;
    protected _include(pattern: string): void;
    protected _exclude(pattern: string): void;
}
