import { fetch } from "lol/js/node/fs";
import { PathBuilder, toWebString } from "./path/path";
const PATH = new PathBuilder("");
export class FileList {
    constructor() {
        this.entries = [];
        this.filelist = {
            pending: true,
            include: [],
            exclude: []
        };
    }
    include(...patterns) {
        for (const pattern of patterns) {
            this._include(toWebString(pattern));
        }
        return this;
    }
    exclude(...patterns) {
        for (const pattern of patterns) {
            this._exclude(toWebString(pattern));
        }
        return this;
    }
    shadow(...patterns) {
        for (const pattern of patterns) {
            this._push(toWebString(pattern));
        }
        return this;
    }
    resolve(force = false) {
        if (force)
            this.filelist.pending = true;
        if (this.filelist.pending) {
            const files = fetch(this.filelist.include, this.filelist.exclude);
            for (const file of files) {
                this._push(file);
            }
        }
        return this.entries.slice(0);
    }
    _push(file) {
        const f = PATH.set(file).web();
        if (!this.entries.includes(f)) {
            this.entries.push(f);
        }
    }
    _include(pattern) {
        this.filelist.include.push(PATH.set(pattern).unix());
    }
    _exclude(pattern) {
        this.filelist.exclude.push(PATH.set(pattern).unix());
    }
}
