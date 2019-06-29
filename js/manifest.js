"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./utils/fs");
class Manifest {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.manifest = {
            asset_key: this.hash_key,
            date: new Date,
            load_path: [],
            dst_path: this.pipeline.dst_path,
            assets: {}
        };
        this.read = false;
        this.save = true;
    }
    get manifest_path() {
        return `tmp/manifest-${this.hash_key}.json`;
    }
    get hash_key() {
        return this.pipeline.hash_key;
    }
    get load_paths() {
        return this.pipeline.load_paths;
    }
    fileExists() {
        return this.save && fs_1.isFile(this.manifest_path);
    }
    createFile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.manifest.asset_key = this.hash_key;
            this.manifest.date = new Date;
            this.manifest.load_path = this.load_paths.get_paths();
            this.manifest.dst_path = this.pipeline.dst_path;
            if (this.save) {
                yield fs_1.writeFile(JSON.stringify(this.manifest, null, 2), this.manifest_path);
            }
        });
    }
    updateFile() {
        return this.createFile();
    }
    readFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.isFile(this.manifest_path)) {
                const content = yield fs_1.readFile(this.manifest_path);
                this.manifest = JSON.parse(content.toString('utf-8'));
            }
            if (this.save) {
                yield this.createFile();
            }
        });
    }
    deleteFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.isFile(this.manifest_path)) {
                yield fs_1.remove(this.manifest_path);
            }
        });
    }
}
exports.Manifest = Manifest;
