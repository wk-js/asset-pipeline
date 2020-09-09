"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
const pipeline_1 = require("./pipeline");
const path_1 = require("./path");
class Resolver {
    constructor(pid) {
        this.pid = pid;
        this.root = {
            path: '.',
            files: [],
            subdirectories: {}
        };
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    /**
     * Look for outputPath
     */
    resolve(inputPath) {
        if (!this.pipeline)
            return inputPath;
        const { cache, manifest } = this.pipeline;
        inputPath = path_1.normalize(inputPath, "web");
        const extra = inputPath.match(/\#|\?/);
        let suffix = '';
        if (extra) {
            suffix = extra[0] + inputPath.split(extra[0])[1];
            inputPath = inputPath.split(extra[0])[0];
        }
        let output = inputPath;
        const asset = manifest.get(inputPath);
        if (asset) {
            output = cache.enabled ? asset.cache : asset.output;
        }
        output = path_1.normalize(output, "web");
        output = output + suffix;
        return output;
    }
    /**
     * Refresh output tree
     */
    refreshTree() {
        if (!this.pipeline)
            return;
        const { cache, manifest } = this.pipeline;
        const tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
        const keys = manifest.export("asset").map((asset) => {
            return cache.enabled ? asset.cache : asset.output;
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
                    path: path_1.normalize(path, "web"),
                    files: [],
                    subdirectories: {}
                };
                currDir = currDir.subdirectories[dir];
            });
            if (this.pipeline.output.with(keys[i]).ext().length > 0) {
                currDir.files.push(file);
            }
            else {
                currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} };
            }
        }
        this.root = tree;
    }
    /**
     * Convert inputPath to outputPath and return its directory tree
     */
    getTree(inputPath) {
        const outputPath = this.resolve(inputPath);
        const dirs = path_1.normalize(outputPath, "web").split('/');
        let tree = this.root;
        for (let i = 0, ilen = dirs.length; i < ilen; i++) {
            if (tree.subdirectories[dirs[i]]) {
                tree = tree.subdirectories[dirs[i]];
            }
        }
        return tree;
    }
    /**
     * Preview output tree
     */
    view() {
        if (!this.pipeline)
            return "";
        function ptree(tree, tab) {
            let print = '';
            Object.keys(tree.subdirectories).forEach(function (dir) {
                print += tab + dir + '\n';
                print += ptree(tree.subdirectories[dir], tab + "  ") + '\n';
            });
            print += tab + tree.files.join(`\n${tab}`);
            return print;
        }
        const output = this.pipeline.cwd.relative(this.pipeline.output.os()).web();
        return output + '\n' + ptree(this.root, "  ").replace(/\n\s+\n/g, '\n');
    }
}
exports.Resolver = Resolver;
