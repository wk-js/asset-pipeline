import { Pipeline } from "./pipeline";
import { IPathObject, IResolvePathOptions } from "./types";
import { PathWrapper } from "./path";
export declare class Resolver {
    private pid;
    private _output;
    host: string;
    constructor(pid: string);
    get pipeline(): Pipeline | undefined;
    get source(): import("./source").SourceManager | undefined;
    get manifest(): import("./manifest").Manifest | undefined;
    get tree(): import("./tree").Tree | undefined;
    clone(resolve: Resolver): void;
    output(path?: string): PathWrapper;
    getPath(path: string, options?: Partial<IResolvePathOptions>): string;
    getUrl(path: string, options?: Partial<IResolvePathOptions>): string;
    /**
     * Looking for source from a path by checking base directory
     */
    findSource(path: string): import("./source").Source | undefined;
    /**
     * Looking for a source and
     */
    parse(path: string): IPathObject;
    getInputFromOutput(output: string, absolute?: boolean): string | undefined;
    getAssetFromOutput(output: string): import("./types").IAsset | undefined;
}
