"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("wkt/js/api/file/utils");
const path_1 = require("path");
const when_1 = require("when");
const utils_2 = require("./utils");
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
        return when_1.reduce(['move', 'copy', 'symlink'], (reduction, value) => {
            return this.apply(value);
        }, null);
    }
    apply(type) {
        const validGlobs = this.globs.filter((item) => {
            return item.action === type;
        }).map(item => this.pipeline.fromLoadPath(item.glob));
        const ignoredGlobs = this.globs.filter((item) => {
            return item.action === 'ignore';
        }).map(item => this.pipeline.fromLoadPath(item.glob));
        const ios = (type === 'symlink' ?
            utils_2.fetchDirs(validGlobs, ignoredGlobs)
            :
                utils_1.fetch(validGlobs, ignoredGlobs))
            .map((file) => {
            file = path_1.relative(this.pipeline.absolute_load_path, file);
            let input = this.pipeline.fromLoadPath(file);
            let output = this.pipeline.fromDstPath(this.pipeline.tree.getPath(file));
            input = path_1.relative(process.cwd(), input);
            output = path_1.relative(process.cwd(), output);
            return [input, output.split('?')[0]];
        });
        return when_1.reduce(ios, (arr, io) => {
            if (type === 'copy') {
                return utils_1.copy(io[0], io[1]);
            }
            else if (type === 'move') {
                return utils_1.move(io[0], io[1]);
            }
            else if (type === 'symlink') {
                return utils_2.symlink(io[0], io[1]);
            }
        }, null);
    }
}
exports.Manager = Manager;
