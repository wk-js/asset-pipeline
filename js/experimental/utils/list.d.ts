export declare class List<T> {
    protected _next?: List<T>;
    protected _prev?: List<T>;
    protected _first: List<T>;
    protected _last: List<T>;
    protected _item?: T;
    constructor();
    push(item: T): void;
    unshift(item: T): void;
    foreach(callback: (item: T) => void): void;
    map<TT>(callback: (item: T) => TT): List<TT>;
    filter(callback: (item: T) => boolean): List<T>;
    getNext(): List<T> | undefined;
    getPrev(): List<T> | undefined;
    getFirst(): List<T>;
    getLast(): List<T>;
    getItem(): T | undefined;
    getLength(): number;
    toArray(): T[];
    static fromArray<T>(arr: T[]): List<T>;
}
