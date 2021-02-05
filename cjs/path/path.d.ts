export declare type PathOrString = string | PathBuilder;
export declare class PathBuilder {
    private path;
    constructor(path: PathOrString);
    clone(): PathBuilder;
    os(): string;
    unix(): string;
    web(): string;
    ext(): string;
    base(): string;
    name(): string;
    dir(): string;
    set(path: PathOrString): this;
    isAbsolute(): boolean;
    join(...parts: PathOrString[]): PathBuilder;
    with(...parts: PathOrString[]): PathBuilder;
    relative(to: PathOrString): PathBuilder;
    toString(type?: "unix" | "web" | "os"): string;
}
export declare function toUnixString(pattern: PathOrString): string;
export declare function toWebString(pattern: PathOrString): string;
export declare function toOsString(pattern: PathOrString): string;
export declare function toPath(pattern: PathOrString): PathBuilder;
