"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./utils/path");
const path_2 = __importDefault(require("path"));
class Tree {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
    }
    build(path) {
        path = path_1.cleanPath(path);
        const extra = path.match(/\#|\?/);
        let suffix = '';
        if (extra) {
            suffix = extra[0] + path.split(extra[0])[1];
            path = path.split(extra[0])[0];
        }
        let output = path;
        const asset = this.pipeline.resolve.asset(path);
        if (asset) {
            output = this.pipeline.cache.enabled ? asset.cache : asset.output;
        }
        output = path_1.cleanPath(output);
        output = process.platform === 'win32' ? path_1.toUnixPath(output) : output;
        output = output + suffix;
        return output;
    }
    update() {
        const tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
        const keys = this.pipeline.manifest.all().map((asset) => {
            return this.build(asset.input);
        });
        let currDir = tree;
        let path = tree.path;
        for (let i = 0, ilen = keys.length; i < ilen; i++) {
            const dirs = keys[i].split('/');
            const file = dirs.pop();
            currDir = tree;
            path = tree.path;
            dirs.forEach(function (dir) {
                path += '/' + dir;
                currDir.subdirectories[dir] = currDir.subdirectories[dir] || {
                    path: path_1.cleanPath(path),
                    files: [],
                    subdirectories: {}
                };
                currDir = currDir.subdirectories[dir];
            });
            if (path_2.default.extname(this.pipeline.resolve.output_with(keys[i])).length > 0) {
                currDir.files.push(file);
            }
            else {
                currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} };
            }
        }
        this.tree = tree;
    }
    resolve(path) {
        const dirs = path_1.cleanPath(path).split('/');
        let tree = this.tree;
        for (let i = 0, ilen = dirs.length; i < ilen; i++) {
            if (tree.subdirectories[dirs[i]]) {
                tree = tree.subdirectories[dirs[i]];
            }
        }
        return tree;
    }
    view() {
        function ptree(tree, tab) {
            let print = '';
            Object.keys(tree.subdirectories).forEach(function (dir) {
                print += tab + dir + '\n';
                print += ptree(tree.subdirectories[dir], tab + "  ") + '\n';
            });
            print += tab + tree.files.join(`\n${tab}`);
            return print;
        }
        return this.pipeline.resolve.output + '\n' + ptree(this.tree, "  ").replace(/\n\s+\n/g, '\n');
    }
}
exports.Tree = Tree;
