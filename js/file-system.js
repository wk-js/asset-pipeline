"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./utils/fs");
const path_1 = require("path");
class FileSystem {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.globs = [];
    }
    get load_paths() {
        return this.pipeline.load_paths;
    }
    get resolver() {
        return this.pipeline.resolver;
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
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            const types = ['move', 'copy', 'symlink'];
            for (let i = 0; i < types.length; i++) {
                yield this._apply(types[i]);
            }
        });
    }
    _apply(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const validGlobs = this.load_paths.filterAndMap(this.globs, (item, load_path) => {
                if (item.action !== type)
                    return false;
                return this.load_paths.fromLoadPath(load_path, item.glob);
            });
            const ignoredGlobs = this.load_paths.filterAndMap(this.globs, (item, load_path) => {
                if (item.action !== 'ignore')
                    return false;
                return this.load_paths.fromLoadPath(load_path, item.glob);
            });
            const files = (type === 'symlink' ?
                fs_1.fetchDirs(validGlobs, ignoredGlobs)
                :
                    fs_1.fetch(validGlobs, ignoredGlobs));
            const ios = this.load_paths.filterAndMap(files, (file, load_path) => {
                const relative_file = this.load_paths.relativeToLoadPath(load_path, file);
                // Future
                // Maybe copy only resolved files
                // this.pipeline.tree.is_resolved( relative_file )
                const input = path_1.relative(process.cwd(), file);
                let output = this.pipeline.fromDstPath(this.resolver.getPath(relative_file));
                output = path_1.relative(process.cwd(), output);
                if (input == output)
                    return false;
                return [input, output.split(/\#|\?/)[0]];
            });
            for (let i = 0; i < ios.length; i++) {
                const io = ios[i];
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
