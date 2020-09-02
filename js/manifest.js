"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manifest = void 0;
const pipeline_1 = require("./pipeline");
const fs_1 = require("lol/js/node/fs");
const path_1 = require("./path");
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
        this.readOnDisk = false;
        this.saveOnDisk = true;
        this.saveAtChange = false;
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    clone(manifest) {
        manifest;
        manifest.readOnDisk = this.readOnDisk;
        manifest.saveOnDisk = this.saveOnDisk;
        manifest.saveAtChange = this.saveAtChange;
    }
    get manifest_path() {
        if (!this.pipeline)
            return `tmp/manifest.json`;
        return `tmp/manifest-${this.pipeline.cache.key}.json`;
    }
    fileExists() {
        return this.saveOnDisk && fs_1.isFile(this.manifest_path);
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.pipeline)
                return;
            this._file.key = this.pipeline.cache.key;
            this._file.date = new Date;
            this._file.sources = this.pipeline.source.all().map(s => s.path.toWeb());
            this._file.output = this.pipeline.resolve.output().toWeb();
            if (this.saveOnDisk) {
                yield fs_1.writeFile(JSON.stringify(this._file, null, 2), this.manifest_path);
            }
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.isFile(this.manifest_path)) {
                const content = yield fs_1.readFile(this.manifest_path);
                this._file = JSON.parse(content.toString('utf-8'));
            }
            if (this.saveOnDisk) {
                yield this.save();
            }
        });
    }
    deleteOnDisk() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.isFile(this.manifest_path)) {
                yield fs_1.remove(this.manifest_path);
            }
        });
    }
    get(input) {
        input = path_1.normalize(input, "web");
        input = input.split(/\#|\?/)[0];
        return this._file.assets[input];
    }
    has(input) {
        return !!this.get(input);
    }
    add(asset) {
        this._file.assets[asset.input] = asset;
        if (this.saveAtChange) {
            this.save();
        }
    }
    remove(input) {
        let asset;
        if (typeof input === "string") {
            asset = this.get(input);
        }
        else {
            asset = input;
        }
        if (asset) {
            delete this._file.assets[asset.input];
            if (this.saveAtChange) {
                this.save();
            }
        }
    }
    clear() {
        this._file.assets = {};
        if (this.saveAtChange) {
            this.save();
        }
    }
    export(type = "asset", tag) {
        switch (type) {
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
                            output: {
                                path: pipeline.resolve.getPath(input),
                                url: pipeline.resolve.getUrl(input),
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
