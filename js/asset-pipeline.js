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
const path_1 = require("path");
const tree_1 = require("./tree");
const manager_1 = require("./manager");
const file_pipeline_1 = require("./file-pipeline");
const directory_pipeline_1 = require("./directory-pipeline");
const manifest_1 = require("./manifest");
const renderer_1 = require("./renderer");
const file_resolver_1 = require("./file-resolver");
class AssetPipeline {
    constructor() {
        this.load_path = null;
        this.load_paths = new file_resolver_1.Resolver();
        this.dst_path = './public';
        this.root_path = process.cwd();
        this.cacheable = false;
        this.cache_type = 'hash';
        this.prefix = '';
        this.asset_key = 'no_key';
        this.asset_host = null;
        this.force_resolve = false;
        this.save_manifest = true;
        this.verbose = false;
        this.data = {};
        this.tree = new tree_1.Tree(this);
        this.manager = new manager_1.Manager(this);
        this.manifest = new manifest_1.Manifest(this);
        this.renderer = new renderer_1.Renderer(this);
        this.file = new file_pipeline_1.FilePipeline(this);
        this.directory = new directory_pipeline_1.DirectoryPipeline(this);
    }
    get absolute_dst_path() {
        return path_1.join(this.root_path, this.dst_path);
    }
    fromDstPath(path) {
        return path_1.join(this.absolute_dst_path, path);
    }
    getPath(path, fromPath) {
        return this.tree.getPath(path, fromPath);
    }
    getUrl(path, fromPath) {
        return this.tree.getUrl(path, fromPath);
    }
    resolve(force) {
        force = force ? force : this.force_resolve;
        this.load_paths.root_path = this.root_path;
        if (this.load_path)
            this.load_paths.add(this.load_path);
        if (force || !this.manifest.fileExists()) {
            this.log('[AssetPipeline] Fetch directories');
            this.directory.fetch();
            this.tree.update();
            this.log('[AssetPipeline] Fetch files');
            this.file.fetch();
            this.tree.update();
            this.log('[AssetPipeline] Clean resolved paths');
            this.tree.clean_resolved();
            this.log('[AssetPipeline] Update manifest');
            return this.manifest.updateFile();
        }
        else {
            this.log('[AssetPipeline] Read manifest');
            return this.manifest.readFile();
        }
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.renderer.render();
            return this.renderer.edit();
        });
    }
    addEntry(input, output, parameters = {}) {
        parameters = Object.assign({
            rename: output,
            keep_path: false
        }, parameters);
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
    getFileRules(file) {
        return this.file.getRules(file);
    }
    getDirectoryRules(directory) {
        return this.directory.getRules(directory);
    }
    log(...args) {
        if (this.verbose)
            console.log(...args);
    }
}
exports.AssetPipeline = AssetPipeline;
