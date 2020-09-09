export interface TreeInterface {
    path: string;
    files: string[];
    subdirectories: {
        [key: string]: TreeInterface;
    };
}
export declare class Resolver {
    private pid;
    root: TreeInterface;
    constructor(pid: string);
    get pipeline(): import("./pipeline").Pipeline | undefined;
    resolve(inputPath: string): string;
    refreshTree(): void;
    getTree(inputPath: string): TreeInterface;
    view(): string;
}
