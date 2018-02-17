"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("./utils/fs");
const array_1 = require("lol/utils/array");
const minimatch_1 = __importDefault(require("minimatch"));
const utils_1 = require("./utils");
const file_pipeline_1 = require("./file-pipeline");
class DirectoryPipeline extends file_pipeline_1.FilePipeline {
    fetch() {
        const globs = this.rules.map((item) => {
            return this.pipeline.fromLoadPath(item.glob);
        });
        array_1.unique(utils_1.fetchDirs(globs))
            .map((input) => {
            input = this.pipeline.relativeToLoadPath(input);
            this.manifest.assets[input] = {
                input: input,
                output: input,
                cache: input
            };
            this.resolve(input);
            return this.manifest.assets[input];
        })
            .forEach((item) => {
            const subdirs = fs_1.fetch(this.pipeline.fromLoadPath(item.input) + '/**/*').map((input) => {
                input = path_1.dirname(input);
                input = this.pipeline.relativeToLoadPath(input);
                this.manifest.assets[input] = {
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
        }
        return rules;
    }
}
exports.DirectoryPipeline = DirectoryPipeline;
