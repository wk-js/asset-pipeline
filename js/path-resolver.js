"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const url_1 = require("url");
const path_2 = require("./utils/path");
class PathResolver {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this._tree = {
            path: '.',
            files: [],
            subdirectories: {}
        };
        this._resolved_paths = [];
    }
    get manifest() {
        return this.pipeline.manifest.manifest;
    }
    get cacheable() {
        return this.pipeline.cacheable;
    }
    get host() {
        return this.pipeline.host;
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
    getAsset(path) {
        path = path_1.normalize(path);
        path = path.split(/\#|\?/)[0];
        return this.manifest.assets[path];
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
        const asset = this.getAsset(path);
        if (asset) {
            output = this.cacheable ? asset.cache : asset.output;
        }
        output = path_2.clean_path(output);
        output = process.platform === 'win32' ? path_2.to_unix_path(output) : output;
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
        this._resolved(path);
        return output;
    }
    /**
     * @param {string} path - Path required
     * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
     */
    getUrl(path, fromPath) {
        path = this.getPath(path, fromPath);
        if (this.host) {
            const url = new url_1.URL(path, this.host);
            path = url.href;
        }
        return path;
    }
    getFilePath(path, fromPath) {
        path = this.getPath(path, fromPath);
        return path_2.remove_search(path);
    }
    getFileUrl(path, fromPath) {
        path = this.getUrl(path, fromPath);
        return path_2.remove_search(path);
    }
    getSourceFilePath(path, fromPath) {
        const inputs = Object.keys(this.manifest.assets);
        let asset = null;
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (this.manifest.assets[input].output == path || this.manifest.assets[input].cache == path) {
                asset = this.manifest.assets[input];
                break;
            }
        }
        if (asset) {
            if (fromPath) {
                if (path_1.isAbsolute(fromPath)) {
                    path = this.pipeline.load_paths.from_load_path(asset.load_path, asset.input);
                }
                path = path_1.relative(fromPath, path);
            }
            else {
                path = path_1.join(asset.load_path, asset.input);
            }
        }
        return path_2.to_unix_path(path);
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
    _resolved(path) {
        if (this._resolved_paths.indexOf(path) == -1) {
            this._resolved_paths.push(path);
        }
    }
    is_resolved(path) {
        return this._resolved_paths.indexOf(path) > -1;
    }
    get_resolved() {
        const assets = {};
        Object.keys(this.manifest.assets).forEach((path) => {
            if (this.is_resolved(path)) {
                assets[path] = this.manifest.assets[path];
            }
        });
        return assets;
    }
    clean_resolved() {
        this._resolved_paths = [];
    }
}
exports.PathResolver = PathResolver;
