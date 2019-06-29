"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("./utils/fs");
const minimatch_1 = __importDefault(require("minimatch"));
const file_pipeline_1 = require("./file-pipeline");
class DirectoryPipeline extends file_pipeline_1.FilePipeline {
    constructor() {
        super(...arguments);
        this.type = 'directory';
    }
    fetch() {
        this.pipeline.load_paths
            .fetchDirs(this.rules)
            .map((asset) => {
            this.manifest.assets[asset.input] = asset;
            this.resolve(asset.input);
            return asset;
        })
            .forEach((item) => {
            const glob = this.pipeline.load_paths.from_load_path(item.load_path, item.input) + '/**/*';
            fs_1.fetch(glob).map((input) => {
                input = path_1.dirname(input);
                input = this.pipeline.load_paths.relative_to_load_path(item.load_path, input);
                this.manifest.assets[input] = {
                    load_path: item.load_path,
                    input: input,
                    output: input,
                    cache: input
                };
                this.resolve(input);
            });
        });
    }
    getRules(dir) {
        let rules = { glob: dir, cache: false };
        for (let i = 0, ilen = this.rules.length, item, relativeGlob; i < ilen; i++) {
            item = this.rules[i];
            // if (dir === item.glob) {
            //   rules = item
            //   break;
            // } else if (minimatch(dir, item.glob)) {
            //   rules = Object.assign(rules, item)
            // }
            if (dir === item.glob || minimatch_1.default(dir, item.glob)) {
                rules = Object.assign(rules, item);
            }
            else if (minimatch_1.default(dir, item.glob + '/**') && typeof item.rename === 'string') {
                rules = Object.assign(rules, Object.assign({}, item, {
                    rename: rules.glob.replace(item.glob, item.rename)
                }));
            }
        }
        return rules;
    }
}
exports.DirectoryPipeline = DirectoryPipeline;
