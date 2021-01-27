import { Manifest } from "./manifest";
import { Resolver } from "./resolver";
import { SourceManager } from "./source";
import { Cache } from "./cache";
import { guid } from "lol/js/string/guid";
import { PathBuilder, URLBuilder } from "./path";
import { ShadowPipeline } from "./shadow-pipeline";
export const PipelineManager = new Map();
export class Pipeline {
    constructor(saltKey = "asset") {
        this.uuid = guid();
        PipelineManager.set(this.uuid, this);
        this.verbose = false;
        this.output = new PathBuilder("public");
        this.host = new URLBuilder("/");
        this.cwd = new PathBuilder(process.cwd());
        this.cache = new Cache();
        this.cache.saltKey = saltKey;
        this.source = new SourceManager(this.uuid);
        this.manifest = new Manifest(this.uuid);
        this.resolver = new Resolver(this.uuid);
        this.shadow = new ShadowPipeline(this.uuid);
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
