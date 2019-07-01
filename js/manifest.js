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
const path_1 = require("./utils/path");
class Manifest {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.file = {
            asset_key: 'no_key',
            date: new Date,
            load_path: [],
            dst_path: './public',
            assets: {}
        };
        this.read = false;
        this.save = true;
    }
    get manifest_path() {
        return `tmp/manifest-${this.pipeline.cache.key}.json`;
    }
    fileExists() {
        return this.save && fs_1.isFile(this.manifest_path);
    }
    createFile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.file.asset_key = this.pipeline.cache.key;
            this.file.date = new Date;
            this.file.load_path = this.pipeline.source.all();
            this.file.dst_path = this.pipeline.resolve.output;
            if (this.save) {
                yield fs_1.writeFile(JSON.stringify(this.file, null, 2), this.manifest_path);
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
                this.file = JSON.parse(content.toString('utf-8'));
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
    get(input) {
        input = path_1.cleanPath(input);
        input = input.split(/\#|\?/)[0];
        return this.file.assets[input];
    }
    has(input) {
        input = path_1.cleanPath(input);
        input = input.split(/\#|\?/)[0];
        return !!this.file.assets[input];
    }
    set(asset) {
        this.file.assets[asset.input] = asset;
    }
    all() {
        return Object.keys(this.file.assets).map((key) => this.file.assets[key]);
    }
}
exports.Manifest = Manifest;
