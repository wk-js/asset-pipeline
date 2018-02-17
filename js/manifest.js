"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./utils/fs");
const when_1 = __importDefault(require("when"));
const DEFAULT_PROMISE = when_1.default(true);
class Manifest {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.manifest = {
            ASSET_KEY: this.pipeline.asset_key,
            DATE: new Date,
            LOAD_PATH: this.pipeline.load_path,
            DIST_PATH: this.pipeline.dst_path,
            ASSETS: {}
        };
    }
    get manifest_path() {
        return `tmp/manifest-${this.pipeline.asset_key}.json`;
    }
    fileExists() {
        return this.pipeline.save_manifest && fs_1.isFile(this.manifest_path);
    }
    createFile() {
        this.manifest.ASSET_KEY = this.pipeline.asset_key;
        this.manifest.DATE = new Date;
        this.manifest.LOAD_PATH = this.pipeline.load_path;
        this.manifest.DIST_PATH = this.pipeline.dst_path;
        if (this.pipeline.save_manifest) {
            return fs_1.writeFile(JSON.stringify(this.manifest, null, 2), this.manifest_path);
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
}
exports.Manifest = Manifest;
