"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = void 0;
const path_1 = __importDefault(require("path"));
const pipeline_1 = require("./pipeline");
const path_2 = require("./path");
class Tree {
    constructor(pid) {
        this.pid = pid;
        this.tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    get manifest() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.manifest;
    }
    get cache() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.cache;
    }
    get resolver() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.resolve;
    }
    build(path) {
        if (!this.cache || !this.manifest)
            return path;
        const manifest = this.manifest;
        const cache = this.cache;
        path = path_2.normalize(path, "web");
        const extra = path.match(/\#|\?/);
        let suffix = '';
        if (extra) {
            suffix = extra[0] + path.split(extra[0])[1];
            path = path.split(extra[0])[0];
        }
        let output = path;
        const asset = manifest.get(path);
        if (asset) {
            output = cache.enabled ? asset.cache : asset.output;
        }
        output = path_2.normalize(output, "web");
        output = output + suffix;
        return output;
    }
    update() {
        if (!this.resolver || !this.manifest)
            return;
        const manifest = this.manifest;
        const resolver = this.resolver;
        const tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
        const keys = manifest.export("asset").map((asset) => {
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
                    path: path_2.normalize(path, "web"),
                    files: [],
                    subdirectories: {}
                };
                currDir = currDir.subdirectories[dir];
            });
            if (resolver.output().with(keys[i]).ext().length > 0) {
                currDir.files.push(file);
            }
            else {
                currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} };
            }
        }
        this.tree = tree;
    }
    resolve(path) {
        const dirs = path_2.normalize(path, "web").split('/');
        let tree = this.tree;
        for (let i = 0, ilen = dirs.length; i < ilen; i++) {
            if (tree.subdirectories[dirs[i]]) {
                tree = tree.subdirectories[dirs[i]];
            }
        }
        return tree;
    }
    view() {
        if (!this.resolver)
            return "";
        const resolver = this.resolver;
        function ptree(tree, tab) {
            let print = '';
            Object.keys(tree.subdirectories).forEach(function (dir) {
                print += tab + dir + '\n';
                print += ptree(tree.subdirectories[dir], tab + "  ") + '\n';
            });
            print += tab + tree.files.join(`\n${tab}`);
            return print;
        }
        let output = path_1.default.relative(process.cwd(), resolver.output().raw());
        output = path_2.normalize(output, "web");
        return output + '\n' + ptree(this.tree, "  ").replace(/\n\s+\n/g, '\n');
    }
}
exports.Tree = Tree;
