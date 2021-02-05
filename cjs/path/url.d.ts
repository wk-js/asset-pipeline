import { PathBuilder, PathOrString } from "./path";
export declare type UrlOrString = string | URLBuilder;
export declare class URLBuilder {
    private _origin;
    pathname: PathBuilder;
    constructor(path: PathOrString, _origin?: string);
    set(url: UrlOrString): this;
    setOrigin(origin: UrlOrString): this;
    setPathname(path: PathOrString): this;
    isValidURL(): boolean;
    clone(): URLBuilder;
    join(...parts: PathOrString[]): URLBuilder;
    with(...parts: PathOrString[]): URLBuilder;
    relative(to: PathOrString): URLBuilder;
    toString(): string;
    toURL(): URL;
}
export declare function toURLString(pattern: UrlOrString): string;
export declare function toURL(pattern: UrlOrString): URLBuilder;
