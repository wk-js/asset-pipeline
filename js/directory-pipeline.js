"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const utils_1 = require("wkt/js/api/file/utils");
const array_1 = require("lol/utils/array");
const minimatch_1 = __importDefault(require("minimatch"));
const utils_2 = require("./utils");
const file_pipeline_1 = require("./file-pipeline");
class DirectoryPipeline extends file_pipeline_1.FilePipeline {
    fetch() {
        const globs = this._globs.map(function (item) {
            return item.glob;
        });
        array_1.unique(utils_2.fetchDirs(globs))
            .map((input) => {
            input = this.pipeline.relativeToLoadPath(input);
            this.manifest.ASSETS[input] = {
                input: input,
                output: input,
                cache: input
            };
            this.resolve(input);
            return this.manifest.ASSETS[input];
        })
            .forEach((item) => {
            const subdirs = utils_1.fetch(this.pipeline.fromLoadPath(item.input) + '/**/*').map((input) => {
                input = path_1.dirname(input);
                input = this.pipeline.relativeToLoadPath(input);
                this.manifest.ASSETS[input] = {
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
        for (let i = 0, ilen = this._globs.length, item, relativeGlob; i < ilen; i++) {
            item = this._globs[i];
            relativeGlob = this.pipeline.relativeToLoadPath(item.glob);
            if (dir === relativeGlob) {
                rules = item;
                break;
            }
            else if (minimatch_1.default(dir, relativeGlob)) {
                rules = Object.assign(rules, item);
            }
        }
        return rules;
    }
}
exports.DirectoryPipeline = DirectoryPipeline;
