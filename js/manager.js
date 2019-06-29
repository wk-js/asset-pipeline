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
const utils_1 = require("./utils");
class Manager {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.globs = [];
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
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            const types = ['move', 'copy', 'symlink'];
            for (let i = 0; i < types.length; i++) {
                yield this.apply(types[i]);
            }
        });
    }
    apply(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const validGlobs = this.pipeline.load_paths.filter_and_map(this.globs, (item, load_path) => {
                if (item.action !== type)
                    return false;
                return this.pipeline.load_paths.from_load_path(load_path, item.glob);
            });
            const ignoredGlobs = this.pipeline.load_paths.filter_and_map(this.globs, (item, load_path) => {
                if (item.action !== 'ignore')
                    return false;
                return this.pipeline.load_paths.from_load_path(load_path, item.glob);
            });
            const files = (type === 'symlink' ?
                utils_1.fetchDirs(validGlobs, ignoredGlobs)
                :
                    fs_1.fetch(validGlobs, ignoredGlobs));
            const ios = this.pipeline.load_paths.filter_and_map(files, (file, load_path) => {
                const relative_file = this.pipeline.load_paths.relative_to_load_path(load_path, file);
                // Future
                // Maybe copy only resolved files
                // this.pipeline.tree.is_resolved( relative_file )
                const input = path_1.relative(process.cwd(), file);
                let output = this.pipeline.fromDstPath(this.pipeline.tree.getPath(relative_file));
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
                    yield utils_1.symlink(io[0], io[1]);
                }
            }
        });
    }
}
exports.Manager = Manager;
