import { Pipeline } from "./pipeline";
export interface TreeInterface {
    path: string;
    files: string[];
    subdirectories: {
        [key: string]: TreeInterface;
    };
}
export declare class Tree {
    private pipeline;
    tree: TreeInterface;
    constructor(pipeline: Pipeline);
    build(path: string): string;
    update(): void;
    resolve(path: string): TreeInterface;
    view(): string;
}
