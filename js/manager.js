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
            const validGlobs = this.globs.filter((item) => {
                return item.action === type;
            }).map(item => this.pipeline.fromLoadPath(item.glob));
            const ignoredGlobs = this.globs.filter((item) => {
                return item.action === 'ignore';
            }).map(item => this.pipeline.fromLoadPath(item.glob));
            const ios = (type === 'symlink' ?
                utils_1.fetchDirs(validGlobs, ignoredGlobs)
                :
                    fs_1.fetch(validGlobs, ignoredGlobs))
                .map((file) => {
                file = path_1.relative(this.pipeline.absolute_load_path, file);
                let input = this.pipeline.fromLoadPath(file);
                let output = this.pipeline.fromDstPath(this.pipeline.tree.getPath(file));
                input = path_1.relative(process.cwd(), input);
                output = path_1.relative(process.cwd(), output);
                return [input, output.split('?')[0]];
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
