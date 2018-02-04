"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const tree_1 = require("./tree");
const manager_1 = require("./manager");
const file_pipeline_1 = require("./file-pipeline");
const directory_pipeline_1 = require("./directory-pipeline");
const manifest_1 = require("./manifest");
class AssetPipeline {
    constructor() {
        this.load_path = './app';
        this.dst_path = './public';
        this.root_path = process.cwd();
        this.cacheable = false;
        this.cacheType = 'hash';
        this.prefix = '';
        this.asset_key = 'no_key';
        this.asset_host = null;
        this.data = {};
        this.tree = new tree_1.Tree(this);
        this.manager = new manager_1.Manager(this);
        this.manifest = new manifest_1.Manifest(this);
        this.file = new file_pipeline_1.FilePipeline(this);
        this.directory = new directory_pipeline_1.DirectoryPipeline(this);
    }
    get absolute_load_path() {
        return path_1.join(this.root_path, this.load_path);
    }
    get absolute_dst_path() {
        return path_1.join(this.root_path, this.dst_path);
    }
    fromLoadPath(path) {
        return path_1.join(this.absolute_load_path, path);
    }
    fromDstPath(path) {
        return path_1.join(this.absolute_dst_path, path);
    }
    relativeToLoadPath(path) {
        return path_1.relative(this.absolute_load_path, path);
    }
    getPath(path, fromPath) {
        return this.tree.getPath(path, fromPath);
    }
    getUrl(path, fromPath) {
        return this.tree.getUrl(path, fromPath);
    }
    resolve(force) {
        force = this.manifest.forceUpdate ? this.manifest.forceUpdate : force;
        if (force || !this.manifest.fileExists()) {
            console.log('[AssetPipeline] Fetch directories');
            this.directory.fetch();
            this.tree.update();
            console.log('[AssetPipeline] Fetch files');
            this.file.fetch();
            this.tree.update();
            console.log('[AssetPipeline] Update manifest');
            return this.manifest.updateFile();
        }
        else {
            console.log('[AssetPipeline] Read manifest');
            return this.manifest.readFile();
        }
    }
    addEntry(input, output, parameters) {
        parameters = Object.assign({
            rename: output,
            keep_path: false
        }, parameters || {});
        this.file.add(input, parameters);
    }
    addFile(glob, parameters) {
        this.file.add(glob, parameters);
    }
    addDirectory(glob, parameters) {
        this.directory.add(glob, parameters);
    }
    ignoreFile(glob) {
        this.file.ignore(glob);
    }
    ignoreDirectory(glob) {
        this.directory.ignore(glob);
    }
}
exports.AssetPipeline = AssetPipeline;
