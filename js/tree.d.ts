import { Pipeline } from "./pipeline";
export interface TreeInterface {
    path: string;
    files: string[];
    subdirectories: {
        [key: string]: TreeInterface;
    };
}
export declare class Tree {
    private pid;
    tree: TreeInterface;
    constructor(pid: string);
    get pipeline(): Pipeline | undefined;
    get manifest(): import("./manifest").Manifest | undefined;
    get cache(): import("./cache").Cache | undefined;
    get resolver(): import("./resolver").Resolver | undefined;
    build(path: string): string;
    update(): void;
    resolve(path: string): TreeInterface;
    view(): string;
}
