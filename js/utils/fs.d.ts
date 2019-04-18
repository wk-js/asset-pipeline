/// <reference types="node" />
import when from "when";
export declare function isFile(path: string): boolean;
export declare function isDirectory(path: string): boolean;
export declare function exists(path: string): boolean;
export declare function copy(fromFile: string, toFile: string): when.Promise<boolean>;
export declare function remove(file: string): when.Promise<boolean>;
export declare function move(fromFile: string, toFile: string): when.Promise<boolean>;
export declare function rename(fromFile: string, toFile: string): when.Promise<boolean>;
export declare function ensureDir(path: string): when.Promise<string>;
export declare function fetch(include: string | string[], exclude?: string | string[]): string[];
export declare function fetchDirs(include: string | string[], exclude?: string | string[]): string[];
export declare function writeFile(content: string | Buffer, file: string): when.Promise<boolean>;
export declare function readFile(file: string, options?: {
    encoding?: string | null;
    flag?: string;
} | string | undefined | null): when.Promise<Buffer>;
export declare type EditFileCallback = (value: string | Buffer) => string | Buffer;
export declare function editFile(file: string, callback: EditFileCallback): when.Promise<boolean>;
