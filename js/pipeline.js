"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = exports.PipelineManager = void 0;
const manifest_1 = require("./manifest");
const resolver_1 = require("./resolver");
const source_1 = require("./source");
const cache_1 = require("./cache");
const guid_1 = require("lol/js/string/guid");
const path_1 = require("./path");
const Path = __importStar(require("path"));
exports.PipelineManager = new Map();
class Pipeline {
    constructor(key) {
        this.uuid = guid_1.guid();
        this.verbose = false;
        this.output = new path_1.PathBuilder("public");
        this.host = new path_1.URLBuilder("/");
        this.cwd = new path_1.PathBuilder(process.cwd());
        this.cache = new cache_1.Cache();
        this.source = new source_1.SourceManager(this.uuid);
        this.manifest = new manifest_1.Manifest(this.uuid);
        this.resolver = new resolver_1.Resolver(this.uuid);
        this.cache.key = key;
        exports.PipelineManager.set(this.uuid, this);
    }
    clone(key) {
        const p = new Pipeline(key);
        this.cache.clone(p.cache);
        this.source.clone(p.source);
        this.manifest.clone(p.manifest);
        return p;
    }
    fetch(force) {
        force = force ? force : !this.manifest.readOnDisk;
        if (force || !this.manifest.fileExists()) {
            this.log('Clear manifest');
            this.manifest.clear();
            this.log('Fetch directories');
            this.source.fetch("directory");
            this.resolver.refreshTree();
            this.log('Fetch files');
            this.source.fetch("file");
            this.resolver.refreshTree();
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
    /**
     * Looking for source from a path by checking base directory
     */
    getSource(inputPath) {
        const sources = this.source.all();
        const source_paths = sources.map(p => {
            if (Path.isAbsolute(inputPath)) {
                return p.fullpath.web();
            }
            return p.path.web();
        });
        inputPath = path_1.normalize(inputPath, "web");
        const dir = [];
        const parts = inputPath.split("/");
        for (const part of parts) {
            dir.push(part);
            const dir_path = path_1.normalize(dir.join("/"), "web");
            const index = source_paths.indexOf(dir_path);
            if (index > -1) {
                const key = sources[index].path.relative(inputPath).web();
                if (this.manifest.has(key))
                    return sources[index];
            }
        }
    }
    /**
     * Looking for a source and
     */
    getAsset(inputPath) {
        let relative = new path_1.PathBuilder(inputPath);
        if (Path.isAbsolute(inputPath)) {
            relative = this.cwd.relative(inputPath);
            const source = this.getSource(relative.web());
            if (!source)
                return undefined;
            inputPath = source.path.relative(relative.os()).web();
        }
        return this.manifest.get(inputPath);
    }
    getPath(inputPath, options) {
        if (!inputPath)
            throw new Error("[asset-pipeline] path cannot be empty");
        const tree = this.resolver;
        const opts = Object.assign({
            from: ".",
            cleanup: false,
        }, options || {});
        // Cleanup path and get the output path
        inputPath = tree.resolve(inputPath);
        // Cleanup from path and get the output tree
        const fromTree = tree.getTree(opts.from);
        // Get output relative to from
        const output = this.output.with(fromTree.path)
            .relative(this.output.with(inputPath).os());
        if (opts.cleanup) {
            return path_1.cleanup(output.web());
        }
        return output.web();
    }
    getUrl(inputPath, options) {
        inputPath = this.getPath(inputPath, options);
        const url = this.host.join(inputPath);
        try {
            return url.toURL().href;
        }
        catch (e) { }
        return this.host.join(inputPath).toString();
    }
    getAssetFromOutput(outputPath) {
        if (!this.manifest)
            return;
        const assets = this.manifest.export();
        for (let i = 0; i < assets.length; i++) {
            const item = assets[i];
            if (item.output == outputPath || item.cache == outputPath) {
                return item;
            }
        }
    }
}
exports.Pipeline = Pipeline;
