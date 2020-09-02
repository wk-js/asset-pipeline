"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = exports.PipelineManager = void 0;
const manifest_1 = require("./manifest");
const tree_1 = require("./tree");
const resolver_1 = require("./resolver");
const source_1 = require("./source");
const cache_1 = require("./cache");
const guid_1 = require("lol/js/string/guid");
exports.PipelineManager = new Map();
class Pipeline {
    constructor(key) {
        this.uuid = guid_1.guid();
        this.verbose = false;
        this.cache = new cache_1.Cache();
        this.resolve = new resolver_1.Resolver(this.uuid);
        this.source = new source_1.SourceManager(this.uuid);
        this.manifest = new manifest_1.Manifest(this.uuid);
        this.tree = new tree_1.Tree(this.uuid);
        this.cache.key = key;
        exports.PipelineManager.set(this.uuid, this);
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
        force = force ? force : !this.manifest.readOnDisk;
        if (force || !this.manifest.fileExists()) {
            this.log('Clear manifest');
            this.manifest.clear();
            this.log('Fetch directories');
            this.source.fetch("directory");
            this.tree.update();
            this.log('Fetch files');
            this.source.fetch("file");
            this.tree.update();
            this.log('Save manifest');
            return this.manifest.save();
        }
        else {
            this.log('Read manifest');
            return this.manifest.read();
        }
    }
    copy() {
        return this.source.copy();
    }
    log(...args) {
        if (this.verbose)
            console.log('[asset-pipeline]', ...args);
    }
}
exports.Pipeline = Pipeline;
