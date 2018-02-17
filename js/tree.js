"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const url_1 = require("url");
/**
 * Clean path
 */
function _cleanPath(input) {
    const i = input.split('/');
    i.push('');
    input = path_1.normalize(i.join('/')).slice(0, -1);
    return input;
}
/**
 *
 */
function _toUnixPath(pth) {
    pth = pth.replace(/\\/g, '/');
    const double = /\/\//;
    while (pth.match(double)) {
        pth = pth.replace(double, '/'); // node on windows doesn't replace doubles
    }
    return pth;
}
class Tree {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this._tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
    }
    get manifest() {
        return this.pipeline.manifest.manifest;
    }
    update() {
        const pipeline = this.pipeline;
        const tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
        const keys = Object.keys(this.manifest.assets).map((key) => {
            return this.buildPath(key);
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
                    path: path_1.normalize(path),
                    files: [],
                    subdirectories: {}
                };
                currDir = currDir.subdirectories[dir];
            });
            if (path_1.extname(pipeline.fromDstPath(keys[i])).length > 0) {
                currDir.files.push(file);
            }
            else {
                currDir.subdirectories[file] = currDir.subdirectories[file] || { files: [], subdirectories: {} };
            }
        }
        this._tree = tree;
    }
    resolve(path) {
        const dirs = path_1.normalize(path).split('/');
        let tree = this._tree;
        for (let i = 0, ilen = dirs.length; i < ilen; i++) {
            if (tree.subdirectories[dirs[i]]) {
                tree = tree.subdirectories[dirs[i]];
            }
        }
        return tree;
    }
    buildPath(path) {
        path = path_1.normalize(path);
        const extra = path.match(/\#|\?/);
        let suffix = '';
        if (extra) {
            suffix = extra[0] + path.split(extra[0])[1];
            path = path.split(extra[0])[0];
        }
        let output = path;
        if (this.manifest.assets[output]) {
            const item = this.manifest.assets[output];
            output = this.pipeline.cacheable ? item.cache : item.output;
            if ("alternatives" in item && typeof item.alternatives) {
                const alts = item.alternatives;
                alts.outputs.forEach((alt) => {
                    var asset_data = this.pipeline.data;
                    var data = alt.data;
                    if (eval(alts.condition)) {
                        output = this.pipeline.cacheable ? alt.cache : alt.output;
                    }
                });
            }
        }
        output = _cleanPath(this.pipeline.prefix + output);
        output = process.platform === 'win32' ? _toUnixPath(output) : output;
        output = output + suffix;
        return output;
    }
    /**
     * @param {string} path - Path required
     * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
     */
    getPath(path, fromPath) {
        if (!fromPath)
            fromPath = this._tree.path;
        fromPath = this.buildPath(fromPath);
        path = this.buildPath(path);
        const fromTree = this.resolve(fromPath);
        const output = path_1.relative(path_1.join(this.pipeline.absolute_dst_path, fromTree.path), path_1.join(this.pipeline.absolute_dst_path, path));
        return output;
    }
    /**
     * @param {string} path - Path required
     * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
     */
    getUrl(path, fromPath) {
        path = this.getPath(path, fromPath);
        if (this.pipeline.asset_host) {
            const url = new url_1.URL(path, this.pipeline.asset_host);
            path = url.href;
        }
        return path;
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
        return ptree(this._tree, "").replace(/\n\s+\n/g, '\n');
    }
}
exports.Tree = Tree;
