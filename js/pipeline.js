"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = require("./manifest");
const tree_1 = require("./tree");
const resolver_1 = require("./resolver");
const source_1 = require("./source");
const cache_1 = require("./cache");
class Pipeline {
    constructor(key) {
        this.verbose = false;
        this.cache = new cache_1.Cache();
        this.source = new source_1.SourceMap();
        this.manifest = new manifest_1.Manifest(this);
        this.resolve = new resolver_1.Resolver(this);
        this.tree = new tree_1.Tree(this);
        this.cache.key = key;
    }
    clone(key) {
        const p = new Pipeline(key);
        this.cache.clone(p.cache);
        this.source.clone(p.source);
        this.manifest.clone(p.manifest);
        this.resolve.clone(p.resolve);
        return p;
    }
    fetch(force) {
        force = force ? force : !this.manifest.read;
        if (force || !this.manifest.fileExists()) {
            this.log('[AssetPipeline] Clear manifest');
            this.manifest.clear();
            this.log('[AssetPipeline] Fetch directories');
            this.source.fetch(this, "directory");
            this.tree.update();
            this.log('[AssetPipeline] Fetch files');
            this.source.fetch(this, "file");
            this.tree.update();
            this.log('[AssetPipeline] Clean resolved paths');
            this.resolve.clean_used();
            this.log('[AssetPipeline] Update manifest');
            return this.manifest.update_file();
        }
        else {
            this.log('[AssetPipeline] Read manifest');
            return this.manifest.read_file();
        }
    }
    copy() {
        return this.source.copy(this);
    }
    log(...args) {
        if (this.verbose)
            console.log(...args);
    }
}
exports.Pipeline = Pipeline;
