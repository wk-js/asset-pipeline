"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_pipeline_1 = require("./file-pipeline");
const directory_pipeline_1 = require("./directory-pipeline");
const manifest_1 = require("./manifest");
const file_system_1 = require("./file-system");
const tree_1 = require("./tree");
const resolver_1 = require("./resolver");
const source_manager_1 = require("./source-manager");
const cache_1 = require("./cache");
class Pipeline {
    constructor() {
        this.verbose = false;
        this.cache = new cache_1.Cache();
        this.source = new source_manager_1.SourceManager(this);
        this.directory = new directory_pipeline_1.DirectoryPipeline(this);
        this.file = new file_pipeline_1.FilePipeline(this);
        this.manifest = new manifest_1.Manifest(this);
        this.resolve = new resolver_1.Resolver(this);
        this.tree = new tree_1.Tree(this);
        this.fs = new file_system_1.FileSystem(this);
    }
    fetch(force) {
        force = force ? force : !this.manifest.read;
        if (force || !this.manifest.fileExists()) {
            this.log('[AssetPipeline] Fetch directories');
            this.directory.fetch();
            this.tree.update();
            this.log('[AssetPipeline] Fetch files');
            this.file.fetch();
            this.tree.update();
            this.log('[AssetPipeline] Clean resolved paths');
            this.resolve.clean_used();
            this.log('[AssetPipeline] Update manifest');
            return this.manifest.update_file();
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
