"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = exports.PipelineManager = void 0;
const manifest_1 = require("./manifest");
const resolver_1 = require("./resolver");
const source_1 = require("./source");
const cache_1 = require("./cache");
const guid_1 = require("lol/js/string/guid");
const path_1 = require("./path");
const shadow_pipeline_1 = require("./shadow-pipeline");
exports.PipelineManager = new Map();
class Pipeline {
    constructor(saltKey = "asset") {
        this.uuid = guid_1.guid();
        exports.PipelineManager.set(this.uuid, this);
        this.verbose = false;
        this.output = new path_1.PathBuilder("public");
        this.host = new path_1.URLBuilder("/");
        this.cwd = new path_1.PathBuilder(process.cwd());
        this.cache = new cache_1.Cache();
        this.cache.saltKey = saltKey;
        this.source = new source_1.SourceManager(this.uuid);
        this.manifest = new manifest_1.Manifest(this.uuid);
        this.resolver = new resolver_1.Resolver(this.uuid);
        this.shadow = new shadow_pipeline_1.ShadowPipeline(this.uuid);
    }
    /**
     * Clone pipeline
     */
    clone(key) {
        const p = new Pipeline(key);
        this.cache.clone(p.cache);
        this.source.clone(p.source);
        this.manifest.clone(p.manifest);
        return p;
    }
    /**
     * Fetch directories, files, update tree and update manifest
     */
    fetch(force) {
        force = force ? force : !this.manifest.readOnDisk;
        if (force || !this.manifest.fileExists()) {
            this.log('Clear manifest');
            this.manifest.clearAssets();
            this.log('Fetch shadows');
            this.shadow.fetch();
            this.resolver.refreshTree();
            this.log('Fetch directories');
            this.source.fetch("directory");
            this.resolver.refreshTree();
            this.log('Fetch files');
            this.source.fetch("file");
            this.resolver.refreshTree();
            this.log('Save manifest');
            return this.manifest.saveFile();
        }
        else {
            this.log('Read manifest');
            return this.manifest.readFile();
        }
    }
    /**
     * Perform copy/move/symlink
     */
    copy() {
        return this.source.copy();
    }
    /**
     * Logger
     */
    log(...args) {
        if (this.verbose)
            console.log('[asset-pipeline]', ...args);
    }
    /**
     * Get path
     */
    getPath(inputPath, options) {
        return this.resolver.getPath(inputPath, options);
    }
    /**
     * Get url
     */
    getUrl(inputPath, options) {
        return this.resolver.getUrl(inputPath, options);
    }
}
exports.Pipeline = Pipeline;
