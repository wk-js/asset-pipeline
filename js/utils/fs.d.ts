/// <reference types="when" />
/// <reference types="node" />
import when from "when";
export declare function isFile(path: string): boolean;
export declare function isDirectory(path: string): boolean;
export declare function copy(fromFile: string, toFile: string): when.Promise<{}>;
export declare function remove(file: string): when.Promise<{}>;
export declare function move(fromFile: string, toFile: string): when.Promise<null>;
export declare function rename(fromFile: string, toFile: string): when.Promise<null>;
export declare function ensureDir(path: string): when.Promise<string>;
export declare function fetch(include: string | string[], exclude?: string | string[]): string[];
export declare function fetchDirs(include: string | string[], exclude?: string | string[]): string[];
export declare function writeFile(content: string | Buffer, file: string): when.Promise<{}>;
export declare function readFile(file: string): when.Promise<Buffer>;
export declare function editFile(file: string, callback: (value: string | Buffer) => string | Buffer): when.Promise<{}>;
