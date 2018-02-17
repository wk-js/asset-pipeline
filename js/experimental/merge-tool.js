"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("lol/utils/object");
class MergeTool {
    static fetch_data(...pipelines) {
        const data = {};
        for (let i = 0, ilen = pipelines.length; i < ilen; i++) {
            object_1.merge(data, pipelines[i].data);
        }
        return data;
    }
    static fetch_assets(...pipelines) {
        const assets = {};
        for (let i = 0, ilen = pipelines.length; i < ilen; i++) {
            object_1.merge(assets, pipelines[i].manifest.manifest.assets);
        }
        return assets;
    }
    static fetch_rules(...pipelines) {
        let file = [];
        let directory = [];
        for (let i = 0, ilen = pipelines.length; i < ilen; i++) {
            file = file.concat(pipelines[i].file.rules);
            directory = directory.concat(pipelines[i].directory.rules);
        }
        return { file, directory };
    }
}
exports.MergeTool = MergeTool;
