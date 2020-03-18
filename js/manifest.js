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
const fs_1 = require("lol/js/node/fs");
const path_1 = require("./utils/path");
class Manifest {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this._file = {
            key: 'no_key',
            date: new Date,
            sources: [],
            output: './public',
            root: process.cwd(),
            assets: {}
        };
        this.read = false;
        this.save = true;
    }
    clone(manifest) {
        manifest.read = this.read;
        manifest.save = this.save;
    }
    get manifest_path() {
        return `tmp/manifest-${this.pipeline.cache.key}.json`;
    }
    fileExists() {
        return this.save && fs_1.isFile(this.manifest_path);
    }
    create_file() {
        return __awaiter(this, void 0, void 0, function* () {
            this._file.key = this.pipeline.cache.key;
            this._file.date = new Date;
            this._file.sources = this.pipeline.source.all();
            this._file.output = this.pipeline.resolve.output();
            this._file.root = this.pipeline.resolve.root();
            if (this.save) {
                yield fs_1.writeFile(JSON.stringify(this._file, null, 2), this.manifest_path);
            }
        });
    }
    update_file() {
        return this.create_file();
    }
    read_file() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.isFile(this.manifest_path)) {
                const content = yield fs_1.readFile(this.manifest_path);
                this._file = JSON.parse(content.toString('utf-8'));
            }
            if (this.save) {
                yield this.create_file();
            }
        });
    }
    delete_file() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.isFile(this.manifest_path)) {
                yield fs_1.remove(this.manifest_path);
            }
        });
    }
    get(input) {
        input = path_1.cleanPath(input);
        input = input.split(/\#|\?/)[0];
        return this._file.assets[input];
    }
    has(input) {
        input = path_1.cleanPath(input);
        input = input.split(/\#|\?/)[0];
        return !!this._file.assets[input];
    }
    set(asset) {
        this._file.assets[asset.input] = asset;
    }
    clear() {
        this._file.assets = {};
    }
    all(tag) {
        const assets = Object.keys(this._file.assets).map((key) => this._file.assets[key]);
        if (typeof tag == 'string')
            return assets.filter((asset) => asset.tag == tag);
        return assets;
    }
    all_by_key(tag) {
        const assets = {};
        this.all(tag).forEach((asset) => {
            assets[asset.input] = asset;
        });
        return assets;
    }
    all_outputs(tag) {
        return this.all(tag).map((asset) => {
            const input = asset.input;
            return {
                input,
                output: {
                    path: this.pipeline.resolve.path(input),
                    url: this.pipeline.resolve.url(input),
                }
            };
        });
    }
    all_outputs_by_key(tag) {
        const outputs = {};
        this.all_outputs(tag).forEach((output) => {
            outputs[output.input] = output;
        });
        return outputs;
    }
}
exports.Manifest = Manifest;
