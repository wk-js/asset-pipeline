import { PathOrString } from "./path/path";
export declare class FileList {
    entries: string[];
    protected filelist: {
        pending: boolean;
        include: string[];
        exclude: string[];
    };
    include(...patterns: PathOrString[]): this;
    exclude(...patterns: PathOrString[]): this;
    shadow(...patterns: PathOrString[]): this;
    resolve(force?: boolean): string[];
    protected _push(file: string): void;
    protected _include(pattern: string): void;
    protected _exclude(pattern: string): void;
}
