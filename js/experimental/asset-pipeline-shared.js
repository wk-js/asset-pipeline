"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimatch_1 = __importDefault(require("minimatch"));
const merge_tool_1 = require("./merge-tool");
const fs_1 = require("../utils/fs");
class AssetPipelineShared {
    constructor() {
        this.pipelines = [];
        this.rules = {
            file: [],
            directory: []
        };
        this.assets = {};
        this.data = {};
    }
    update() {
        this.data = merge_tool_1.MergeTool.fetch_data.apply(null, this.pipelines);
        this.assets = merge_tool_1.MergeTool.fetch_assets.apply(null, this.pipelines);
        this.rules = merge_tool_1.MergeTool.fetch_rules.apply(null, this.pipelines);
    }
    fromLoadPath(path) {
        for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
            result = this.pipelines[i].fromLoadPath(path);
            if (fs_1.exists(result))
                return result;
        }
        return path;
    }
    fromDstPath(path) {
        for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
            result = this.pipelines[i].fromDstPath(path);
            if (fs_1.exists(result))
                return result;
        }
        return path;
    }
    relativeToLoadPath(path) {
        for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
            result = this.pipelines[i].relativeToLoadPath(path);
            if (fs_1.exists(result))
                return result;
        }
        return path;
    }
    getPath(path) {
        for (let i = 0, result, ilen = this.pipelines.length; i < ilen; i++) {
            result = this.pipelines[i].fromDstPath(this.pipelines[i].getPath(path));
            if (fs_1.exists(result))
                return result;
        }
        return path;
    }
    getFileRules(file) {
        let rules = {};
        for (let i = 0, ilen = this.rules.file.length, item, relativeGlob; i < ilen; i++) {
            item = this.rules.file[i];
            if (file === item.glob || minimatch_1.default(file, item.glob)) {
                rules = Object.assign(rules, item);
            }
        }
        return rules;
    }
    getDirectoryRules(dir) {
        let rules = { glob: dir, cache: false };
        for (let i = 0, ilen = this.rules.directory.length, item, relativeGlob; i < ilen; i++) {
            item = this.rules.directory[i];
            if (dir === item.glob || minimatch_1.default(dir, item.glob)) {
                rules = Object.assign(rules, item);
            }
        }
        return rules;
    }
}
exports.AssetPipelineShared = AssetPipelineShared;
