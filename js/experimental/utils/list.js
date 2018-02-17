"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class List {
    constructor() {
        this._first = this;
        this._last = this;
    }
    push(item) {
        let base = this;
        while (base != undefined) {
            let next = base._next;
            if (next) {
                base = next;
            }
            else {
                next = new List();
                next._item = item;
                next._prev = base;
                base._next = next;
                next._last = next;
                next._first = base._first;
                let b = base._first;
                while (b) {
                    b._last = next;
                    b = b._next;
                }
                break;
            }
        }
    }
    unshift(item) {
        let base = this;
        while (base != undefined) {
            let prev = base._prev;
            if (prev) {
                base = prev;
            }
            else {
                prev = new List();
                base._first._item = item;
                prev._next = base;
                base._prev = prev;
                prev._first = prev;
                prev._last = base._last;
                let b = base._last;
                while (b) {
                    b._first = prev;
                    b = b._prev;
                }
                break;
            }
        }
    }
    foreach(callback) {
        let base = this._first;
        while (base != undefined) {
            let next = base._next;
            if (next)
                callback(next._item);
            base = next;
        }
    }
    map(callback) {
        const map_list = new List();
        let base = this._first;
        while (base != undefined) {
            let next = base._next;
            if (next) {
                map_list.push(callback(next._item));
            }
            base = next;
        }
        return map_list;
    }
    filter(callback) {
        const filter_list = new List();
        let base = this._first;
        while (base != undefined) {
            let next = base._next;
            if (next) {
                if (callback(next._item)) {
                    filter_list.push(next._item);
                }
            }
            base = next;
        }
        return filter_list;
    }
    getNext() {
        return this._next;
    }
    getPrev() {
        return this._prev;
    }
    getFirst() {
        return this._first;
    }
    getLast() {
        return this._last;
    }
    getItem() {
        if (this === this._first) {
            const next = this.getNext();
            return next ? next._item : undefined;
        }
        return this._item;
    }
    getLength() {
        return this.toArray().length;
    }
    toArray() {
        const arr = [];
        let base = this._first;
        while (base) {
            let next = base._next;
            if (next)
                arr.push(next._item);
            base = next;
        }
        return arr;
    }
    static fromArray(arr) {
        const list = new List();
        for (let i = 0, ilen = arr.length; i < ilen; i++) {
            list.push(arr[i]);
        }
        return list;
    }
}
exports.List = List;
