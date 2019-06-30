"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const path_resolver_1 = require("./path-resolver");
const file_pipeline_1 = require("./file-pipeline");
const directory_pipeline_1 = require("./directory-pipeline");
const manifest_1 = require("./manifest");
const file_matcher_1 = require("./file-matcher");
const file_system_1 = require("./file-system");
class Pipeline {
    constructor() {
        this.dst_path = './public';
        this.root_path = process.cwd();
        this.cacheable = false;
        this.cache_type = 'hash';
        this.hash_key = 'no_key';
        this.host = null;
        this.verbose = false;
        this.load_paths = new file_matcher_1.FileMatcher(this);
        this.directory = new directory_pipeline_1.DirectoryPipeline(this);
        this.file = new file_pipeline_1.FilePipeline(this);
        this.manifest = new manifest_1.Manifest(this);
        this.resolver = new path_resolver_1.PathResolver(this);
        this.fs = new file_system_1.FileSystem(this);
    }
    get absolute_dst_path() {
        return path_1.join(this.root_path, this.dst_path);
    }
    fromDstPath(path) {
        return path_1.join(this.absolute_dst_path, path);
    }
    resolve(force) {
        force = force ? force : !this.manifest.read;
        if (force || !this.manifest.fileExists()) {
            this.log('[AssetPipeline] Fetch directories');
            this.directory.fetch();
            this.resolver.update();
            this.log('[AssetPipeline] Fetch files');
            this.file.fetch();
            this.resolver.update();
            this.log('[AssetPipeline] Clean resolved paths');
            this.resolver.cleanResolved();
            this.log('[AssetPipeline] Update manifest');
            return this.manifest.updateFile();
        }
        else {
            this.log('[AssetPipeline] Read manifest');
            return this.manifest.readFile();
        }
    }
    log(...args) {
        if (this.verbose)
            console.log(...args);
    }
}
exports.Pipeline = Pipeline;
