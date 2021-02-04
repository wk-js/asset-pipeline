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
require("./types");
const fs_1 = require("fs");
const fs_2 = require("lol/js/node/fs");
const path_1 = require("../../path");
const array_1 = require("lol/js/array/array");
const path_2 = require("path");
const logger_1 = require("../../logger");
const PATH = new path_1.PathBuilder("");
class FileSystem {
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
                fs_2.fetchDirs(validGlobs, ignoredGlobs)
                :
                    fs_2.fetch(validGlobs, ignoredGlobs));
            let ios = [];
            files.forEach(file => {
                const input = PATH.set(file).unix();
                const output = this.resolver.getOutputPath(file);
                if (input !== output) {
                    return ios.push([input, path_1.cleanup(output)]);
                }
            });
            ios = ios.filter(io => {
                const { mtime } = fs_1.statSync(io[0]);
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
            for (const items of array_1.chunk(ios, this.chunkCount)) {
                const ps = items.map(io => {
                    logger_1.info("[fs]", type, ...io);
                    if (type === 'copy') {
                        return fs_2.copy(io[0], io[1]);
                    }
                    else if (type === 'move') {
                        return fs_2.move(io[0], io[1]);
                    }
                    else if (type === 'symlink') {
                        try {
                            fs_2.ensureDirSync(path_2.dirname(io[1]));
                            fs_1.symlinkSync(io[0], io[1], "junction");
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
exports.FileSystem = FileSystem;
