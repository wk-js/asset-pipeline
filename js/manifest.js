"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./utils/fs");
const promise_1 = require("./utils/promise");
const object_1 = require("lol/utils/object");
const DEFAULT_PROMISE = promise_1.promiseResolved(false);
class Manifest {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.manifest = {
            asset_key: this.pipeline.asset_key,
            date: new Date,
            load_path: this.pipeline.load_path,
            dst_path: this.pipeline.dst_path,
            assets: {}
        };
    }
    get manifest_path() {
        return `tmp/manifest-${this.pipeline.asset_key}.json`;
    }
    fileExists() {
        return this.pipeline.save_manifest && fs_1.isFile(this.manifest_path);
    }
    createFile() {
        this.manifest.asset_key = this.pipeline.asset_key;
        this.manifest.date = new Date;
        this.manifest.load_path = this.pipeline.load_path;
        this.manifest.dst_path = this.pipeline.dst_path;
        if (this.pipeline.save_manifest) {
            return fs_1.writeFile(JSON.stringify(this.manifest, null, 2), this.manifest_path)
                .then(() => true);
        }
        return DEFAULT_PROMISE;
    }
    updateFile() {
        return this.createFile();
    }
    readFile() {
        if (fs_1.isFile(this.manifest_path)) {
            return fs_1.readFile(this.manifest_path).then((content) => {
                this.manifest = JSON.parse(content.toString('utf-8'));
                return true;
            });
        }
        if (this.pipeline.save_manifest) {
            return this.createFile();
        }
        return DEFAULT_PROMISE;
    }
    deleteFile() {
        if (fs_1.isFile(this.manifest_path)) {
            return fs_1.remove(this.manifest_path).then(() => true);
        }
        return DEFAULT_PROMISE;
    }
    getUsedAssets() {
        const manifest = object_1.clone(this.manifest);
        manifest.assets = {};
        Object.keys(this.manifest.assets).forEach((path) => {
            if (this.pipeline.tree.isUsed(path)) {
                manifest.assets[path] = this.manifest.assets[path];
            }
        });
        return manifest;
    }
}
exports.Manifest = Manifest;
