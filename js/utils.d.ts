export declare function fetchDirs(include: string | string[], exclude?: string | string[]): string[];
export declare function isSymbolicLink(path: string): boolean;
export declare function symlink(fromPath: string, toPath: string): Promise<any>;
