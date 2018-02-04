"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("wkt/js/api/file/utils");
const when_1 = __importDefault(require("when"));
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
        return utils_1.isFile(this.manifest_path);
    }
    createFile() {
        this.manifest.ASSET_KEY = this.pipeline.asset_key;
        this.manifest.DATE = new Date;
        this.manifest.LOAD_PATH = this.pipeline.load_path;
        this.manifest.DIST_PATH = this.pipeline.dst_path;
        return utils_1.writeFile(JSON.stringify(this.manifest, null, 2), this.manifest_path);
    }
    updateFile() {
        return this.createFile();
    }
    readFile() {
        if (utils_1.isFile(this.manifest_path)) {
            return utils_1.readFile(this.manifest_path).then((content) => {
                this.manifest = JSON.parse(content.toString('utf-8'));
            });
        }
        return this.createFile();
    }
    deleteFile() {
        if (utils_1.isFile(this.manifest_path)) {
            return utils_1.remove(this.manifest_path).then(() => true);
        }
        return when_1.default(true);
    }
}
exports.Manifest = Manifest;
