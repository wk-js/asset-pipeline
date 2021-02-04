import { FileList as FList } from "filelist";
import { fetch } from "lol/js/node/fs";
import { PathBuilder } from "./path";
const PATH = new PathBuilder("");
export class FileList {
    constructor() {
        this.lazy = true;
        this.entries = [];
        this.filelist = new FList();
    }
    include(...patterns) {
        for (const pattern of patterns) {
            this._include(this._toOSPath(pattern));
        }
        return this;
    }
    exclude(...patterns) {
        for (const pattern of patterns) {
            this._exclude(this._toOSPath(pattern));
        }
        return this;
    }
    shadow(...patterns) {
        for (const pattern of patterns) {
            this._push(this._toOSPath(pattern));
        }
        return this;
    }
    resolve(force = false) {
        if (force)
            this.filelist.pending = true;
        if (this.lazy && this.filelist.pending) {
            const files = this.filelist.toArray();
            for (const file of files) {
                this._push(file);
            }
        }
        return this.entries.slice(0);
    }
    _toOSPath(pattern) {
        if (pattern instanceof PathBuilder) {
            return pattern.os();
        }
        else {
            return PATH.set(pattern).os();
        }
    }
    _push(file) {
        const f = PATH.set(file).web();
        if (!this.entries.includes(f)) {
            this.entries.push(f);
        }
    }
    _include(pattern) {
        if (this.lazy) {
            this.filelist.include(pattern);
        }
        else {
            const files = fetch(pattern);
            files.forEach(file => {
                this._push(file);
            });
        }
    }
    _exclude(pattern) {
        if (this.lazy) {
            this.filelist.exclude(pattern);
        }
        else {
            const files = fetch(pattern);
            files.forEach(file => {
                const f = PATH.set(file).web();
                const index = this.entries.indexOf(f);
                if (index > -1) {
                    this.entries.splice(index, 1);
                }
            });
        }
    }
}
