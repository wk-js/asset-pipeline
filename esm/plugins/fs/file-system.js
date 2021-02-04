var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "./types";
import { statSync, symlinkSync } from "fs";
import { fetch, fetchDirs, copy, move, ensureDirSync } from "lol/js/node/fs";
import { cleanup, PathBuilder } from "../../path";
import { chunk } from "lol/js/array/array";
import { dirname } from "path";
import { info } from "../../logger";
const PATH = new PathBuilder("");
export class FileSystem {
    constructor(pipeline) {
        this.chunkCount = 15;
        this.mtimes = new Map();
        this.globs = [];
        this.events = pipeline.events;
        this.resolver = pipeline.resolver;
    }
    /**
     * Register a path or a glob pattern for a move
     */
    move(glob) {
        this.globs.push({
            glob: glob,
            action: 'move'
        });
    }
    /**
     * Register a path or a glob pattern for a copy
     */
    copy(glob) {
        this.globs.push({
            glob: glob,
            action: 'copy'
        });
    }
    /**
     * Register a path or a glob pattern for a symlink
     */
    symlink(glob) {
        this.globs.push({
            glob: glob,
            action: 'symlink'
        });
    }
    /**
     * Register a path or a glob pattern to ignore
     */
    ignore(glob) {
        this.globs.push({
            glob: glob,
            action: 'ignore'
        });
    }
    /**
     * Perform move/copy/symlink
     */
    apply(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (force)
                this.mtimes.clear();
            const types = ['move', 'copy', 'symlink'];
            for (let i = 0; i < types.length; i++) {
                yield this._apply(types[i]);
            }
        });
    }
    _apply(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const validGlobs = this.globs
                .filter(glob => glob.action === type)
                .map(glob => PATH.set(glob.glob).unix());
            const ignoredGlobs = this.globs
                .filter(glob => glob.action === "ignore")
                .map(glob => PATH.set(glob.glob).unix());
            let files = (type === 'symlink' ?
                fetchDirs(validGlobs, ignoredGlobs)
                :
                    fetch(validGlobs, ignoredGlobs));
            let ios = [];
            files.forEach(file => {
                const input = PATH.set(file).unix();
                const output = this.resolver.getOutputPath(file);
                if (input !== output) {
                    return ios.push([input, cleanup(output)]);
                }
            });
            ios = ios.filter(io => {
                const { mtime } = statSync(io[0]);
                if (this.mtimes.has(io[0])) {
                    const prev = this.mtimes.get(io[0]);
                    if (mtime <= prev)
                        return false;
                }
                this.mtimes.set(io[0], mtime);
                return true;
            });
            if (ios.length === 0)
                return;
            for (const items of chunk(ios, this.chunkCount)) {
                const ps = items.map(io => {
                    info("[fs]", type, ...io);
                    if (type === 'copy') {
                        return copy(io[0], io[1]);
                    }
                    else if (type === 'move') {
                        return move(io[0], io[1]);
                    }
                    else if (type === 'symlink') {
                        try {
                            ensureDirSync(dirname(io[1]));
                            symlinkSync(io[0], io[1], "junction");
                            return Promise.resolve(true);
                        }
                        catch (e) {
                            return Promise.resolve(false);
                        }
                    }
                });
                yield Promise.all(ps);
            }
            this.events.dispatch("newfilecopied", ios);
        });
    }
}
