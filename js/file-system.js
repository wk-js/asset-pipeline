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
const fs_1 = require("lol/js/node/fs");
const path_1 = require("path");
const fs_2 = require("fs");
class FileSystem {
    constructor(_source) {
        this._source = _source;
        this.globs = [];
        this.mtimes = new Map();
    }
    move(glob) {
        this.globs.push({
            glob: glob,
            action: 'move'
        });
    }
    copy(glob) {
        this.globs.push({
            glob: glob,
            action: 'copy'
        });
    }
    symlink(glob) {
        this.globs.push({
            glob: glob,
            action: 'symlink'
        });
    }
    ignore(glob) {
        this.globs.push({
            glob: glob,
            action: 'ignore'
        });
    }
    clone(fs) {
        for (let i = 0; i < this.globs.length; i++) {
            const glob = this.globs[i];
            fs.globs.push(glob);
        }
        return fs;
    }
    apply(pipeline, force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (force)
                this.mtimes.clear();
            const types = ['move', 'copy', 'symlink'];
            for (let i = 0; i < types.length; i++) {
                yield this._apply(pipeline, types[i]);
            }
        });
    }
    _apply(pipeline, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = pipeline.source.get(this._source);
            if (!source)
                return;
            const resolver = pipeline.resolve;
            const validGlobs = this.globs
                .filter(glob => glob.action === type)
                .map(glob => source.join(pipeline.resolve, glob.glob, true));
            const ignoredGlobs = this.globs
                .filter(glob => glob.action === "ignore")
                .map(glob => source.join(pipeline.resolve, glob.glob, true));
            const files = (type === 'symlink' ?
                fs_1.fetchDirs(validGlobs, ignoredGlobs)
                :
                    fs_1.fetch(validGlobs, ignoredGlobs));
            let ios = [];
            files.forEach(file => {
                const relative_file = resolver.relative(source.path, file);
                const input = path_1.relative(resolver.root(), file);
                let output = resolver.output_with(resolver.path(relative_file));
                output = path_1.relative(resolver.root(), output);
                if (input !== output) {
                    return ios.push([input, output.split(/\#|\?/)[0]]);
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
            for (let i = 0; i < ios.length; i++) {
                const io = ios[i];
                pipeline.log(type, ...io);
                if (type === 'copy') {
                    yield fs_1.copy(io[0], io[1]);
                }
                else if (type === 'move') {
                    yield fs_1.move(io[0], io[1]);
                }
                else if (type === 'symlink') {
                    yield fs_1.symlink2(io[0], io[1]);
                }
            }
        });
    }
}
exports.FileSystem = FileSystem;
