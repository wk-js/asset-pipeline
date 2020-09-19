"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manifest = void 0;
const pipeline_1 = require("./pipeline");
const fs_1 = require("lol/js/node/fs");
const path_1 = require("./path");
const fs_2 = require("fs");
const object_1 = require("lol/js/object");
const path_2 = require("path");
class Manifest {
    constructor(pid) {
        this.pid = pid;
        this._file = {
            key: 'no_key',
            date: new Date,
            sources: [],
            output: './public',
            assets: {}
        };
        // Read on disk (default: false)
        this.readOnDisk = false;
        // Save on disk (default: true)
        this.saveOnDisk = true;
        // Save on disk at each change (default: false)
        this.saveAtChange = false;
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    clone(manifest) {
        manifest.readOnDisk = this.readOnDisk;
        manifest.saveOnDisk = this.saveOnDisk;
        manifest.saveAtChange = this.saveAtChange;
    }
    get manifestPath() {
        if (!this.pipeline)
            return `tmp/manifest.json`;
        return `tmp/manifest-${this.pipeline.cache.saltKey}.json`;
    }
    /**
     * Check if manifest file is created
     */
    fileExists() {
        return this.saveOnDisk && fs_1.isFile(this.manifestPath);
    }
    /**
     * Save manifest file
     */
    saveFile() {
        if (!this.pipeline)
            return;
        this._file.key = this.pipeline.cache.saltKey;
        this._file.date = new Date();
        this._file.sources = this.pipeline.source.all().map(s => s.path.web());
        this._file.output = this.pipeline.output.web();
        if (this.saveOnDisk) {
            fs_1.writeFileSync(JSON.stringify(this._file, null, 2), this.manifestPath);
        }
    }
    /**
     * Read manifest file
     */
    readFile() {
        if (fs_1.isFile(this.manifestPath)) {
            const content = fs_2.readFileSync(this.manifestPath);
            this._file = JSON.parse(content.toString('utf-8'));
        }
        if (this.saveOnDisk) {
            this.saveFile();
        }
    }
    /**
     * Remove manifest file
     */
    removeFile() {
        if (fs_1.isFile(this.manifestPath)) {
            fs_1.removeSync(this.manifestPath);
        }
    }
    /**
     * Get Asset
     */
    getAsset(inputPath) {
        inputPath = path_1.normalize(inputPath, "web");
        if (path_2.isAbsolute(inputPath)) {
            const relative = this.pipeline.cwd.relative(inputPath);
            const source = this.findSource(relative.web());
            if (!source)
                return undefined;
            inputPath = source.path.relative(relative.os()).web();
        }
        inputPath = inputPath.split(/\#|\?/)[0];
        return this._file.assets[inputPath];
    }
    /**
     * Get AssetWithSource object from inputPath
     */
    getAssetWithSource(inputPath) {
        if (!this.pipeline)
            return;
        const asset = this.getAsset(inputPath);
        if (!asset)
            return;
        const source = this.pipeline.source.get(asset.source.uuid);
        if (!source)
            return;
        return Object.assign({ source }, object_1.omit(asset, "source"));
    }
    /**
     * Check asset exists
     */
    hasAsset(inputPath) {
        return !!this.getAsset(inputPath);
    }
    /**
     * Add asset
     */
    addAsset(asset) {
        this._file.assets[asset.input] = asset;
        if (this.saveAtChange) {
            this.saveFile();
        }
    }
    /**
     * Remove asset
     */
    removeAsset(input) {
        let asset;
        if (typeof input === "string") {
            asset = this.getAsset(input);
        }
        else {
            asset = input;
        }
        if (asset) {
            delete this._file.assets[asset.input];
            if (this.saveAtChange) {
                this.saveFile();
            }
        }
    }
    /**
     * Clear manifest
     */
    clearAssets() {
        this._file.assets = {};
        if (this.saveAtChange) {
            this.saveFile();
        }
    }
    /**
     * Get Source object
     */
    findSource(inputPath) {
        if (!this.pipeline)
            return;
        inputPath = path_1.normalize(inputPath, "web");
        const asset = this.getAsset(inputPath);
        if (asset) {
            const source = this.pipeline.source.get(asset.source.uuid);
            if (source)
                return source;
        }
        const sources = this.pipeline.source.all();
        const source_paths = sources.map(p => {
            if (path_2.isAbsolute(inputPath)) {
                return p.fullpath.web();
            }
            return p.path.web();
        });
        const dir = [];
        const parts = inputPath.split("/");
        for (const part of parts) {
            dir.push(part);
            const dir_path = path_1.normalize(dir.join("/"), "web");
            const index = source_paths.indexOf(dir_path);
            if (index > -1) {
                const key = sources[index].path.relative(inputPath).web();
                if (this.hasAsset(key))
                    return sources[index];
            }
        }
    }
    /**
     * Get IAsset object from output
     */
    findAssetFromOutput(outputPath) {
        const assets = this.export();
        for (let i = 0; i < assets.length; i++) {
            const item = assets[i];
            if (item.output == outputPath || item.cache == outputPath) {
                return item;
            }
        }
    }
    export(exportType = "asset", tag) {
        switch (exportType) {
            case "asset":
                {
                    const assets = Object
                        .keys(this._file.assets)
                        .map((key) => this._file.assets[key]);
                    if (typeof tag == 'string')
                        return assets.filter(a => a.tag == tag);
                    return assets;
                }
            case "asset_key":
                {
                    const assets = {};
                    this.export("asset", tag).forEach(a => assets[a.input] = a);
                    return assets;
                }
            case "asset_source":
                {
                    if (!this.pipeline)
                        return [];
                    const { source } = this.pipeline;
                    return this.export("asset", tag)
                        .filter(a => source.has(a.source.uuid))
                        .map(a => {
                        return Object.assign({ source: source.get(a.source.uuid) }, object_1.omit(a, "source"));
                    });
                }
            case "asset_source_key":
                {
                    const assets = {};
                    this.export("asset_source", tag).forEach(a => assets[a.input] = a);
                    return assets;
                }
            case "output":
                {
                    if (!this.pipeline)
                        return [];
                    const pipeline = this.pipeline;
                    const assets = this.export("asset", tag);
                    return assets.map((asset) => {
                        const input = asset.input;
                        return {
                            input,
                            type: asset.type,
                            output: {
                                path: pipeline.getPath(input),
                                url: pipeline.getUrl(input),
                            }
                        };
                    });
                }
            case "output_key":
                {
                    const outputs = {};
                    this.export("output", tag).forEach(o => outputs[o.input] = o);
                    return outputs;
                }
        }
    }
}
exports.Manifest = Manifest;
