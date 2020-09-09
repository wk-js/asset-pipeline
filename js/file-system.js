"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
const fs_1 = require("lol/js/node/fs");
const pipeline_1 = require("./pipeline");
const fs_2 = require("fs");
const path_1 = require("./path");
const array_1 = require("lol/js/array");
class FileSystem {
    constructor(pid, sid) {
        this.pid = pid;
        this.sid = sid;
        this.chunkCount = 15;
        this.globs = [];
        this.mtimes = new Map();
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
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
                fs_1.fetchDirs(validGlobs, ignoredGlobs)
                :
                    fs_1.fetch(validGlobs, ignoredGlobs));
            let ios = [];
            files.forEach(file => {
                const relative_file = source.path.relative(file).web();
                const input = source.fullpath.join(relative_file).web();
                const output = pipeline.output.with(pipeline.getPath(relative_file));
                if (input !== output.web()) {
                    return ios.push([input, path_1.cleanup(output.web())]);
                }
            });
            ios = ios.filter(io => {
                const { mtime } = fs_2.statSync(io[0]);
                if (this.mtimes.has(io[0])) {
                    const prev = this.mtimes.get(io[0]);
                    if (mtime <= prev)
                        return false;
                }
                this.mtimes.set(io[0], mtime);
                return true;
            });
            for (const items of array_1.chunk(ios, this.chunkCount)) {
                const ps = items.map(io => {
                    this._log(type, ...io.map(p => pipeline.cwd.relative(p).web()));
                    if (type === 'copy') {
                        return fs_1.copy(io[0], io[1]);
                    }
                    else if (type === 'move') {
                        return fs_1.move(io[0], io[1]);
                    }
                    else if (type === 'symlink') {
                        return fs_1.symlink2(io[0], io[1]);
                    }
                });
                yield Promise.all(ps);
            }
        });
    }
    _log(...args) {
        var _a;
        (_a = pipeline_1.PipelineManager.get(this.pid)) === null || _a === void 0 ? void 0 : _a.log(...args);
    }
}
exports.FileSystem = FileSystem;
