var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetch, copy, move, fetchDirs, ensureDirSync } from "lol/js/node/fs";
import { PipelineManager } from "./pipeline";
import { statSync, symlinkSync } from 'fs';
import { cleanup } from "./path";
import { chunk } from "lol/js/array";
import { Dispatcher } from "lol/js/dispatcher";
import { dirname } from "path";
export class FileSystem {
    constructor(pid, sid) {
        this.pid = pid;
        this.sid = sid;
        this.chunkCount = 15;
        this.onNewFilesCopied = new Dispatcher();
        this.globs = [];
        this.mtimes = new Map();
    }
    get pipeline() {
        return PipelineManager.get(this.pid);
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
     * Clone FileSystem
     */
    clone(fs) {
        for (let i = 0; i < this.globs.length; i++) {
            const glob = this.globs[i];
            fs.globs.push(glob);
        }
        return fs;
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
            if (!this.pipeline)
                return;
            const pipeline = this.pipeline;
            const source = this.pipeline.source.get(this.sid);
            if (!source)
                return;
            const validGlobs = this.globs
                .filter(glob => glob.action === type)
                .map(glob => source.fullpath.join(glob.glob).web());
            const ignoredGlobs = this.globs
                .filter(glob => glob.action === "ignore")
                .map(glob => source.fullpath.join(glob.glob).web());
            let files = (type === 'symlink' ?
                fetchDirs(validGlobs, ignoredGlobs)
                :
                    fetch(validGlobs, ignoredGlobs));
            let ios = [];
            files.forEach(file => {
                const relative_file = source.fullpath.relative(file).web();
                const input = source.fullpath.join(relative_file).web();
                const output = pipeline.output.with(pipeline.getPath(relative_file));
                if (input !== output.web()) {
                    return ios.push([input, cleanup(output.web())]);
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
                    this._log(type, ...io.map(p => pipeline.cwd.relative(p).web()));
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
            this.onNewFilesCopied.dispatch(ios);
        });
    }
    _log(...args) {
        var _a;
        (_a = PipelineManager.get(this.pid)) === null || _a === void 0 ? void 0 : _a.log(...args);
    }
}
