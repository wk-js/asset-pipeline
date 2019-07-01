"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("./utils/fs");
const file_pipeline_1 = require("./file-pipeline");
const minimatch_1 = __importDefault(require("minimatch"));
const path_2 = require("./utils/path");
class DirectoryPipeline extends file_pipeline_1.FilePipeline {
    constructor(pipeline) {
        super(pipeline);
        this.type = 'directory';
    }
    add(glob, parameters = {}) {
        return super.add(glob, parameters);
    }
    addEntry(input, output, parameters = {}) {
        return super.addEntry(input, output, parameters);
    }
    fetch() {
        this._fetch()
            .map((asset) => {
            this.resolve(asset);
            return asset;
        })
            .forEach((item) => {
            const glob = this.pipeline.source.source_with(item.load_path, item.input, true) + '/**/*';
            // Handle files
            fs_1.fetch(glob).map((input) => {
                input = this.pipeline.resolve.relative(item.load_path, input);
                const pathObject = path_1.default.parse(input);
                pathObject.dir = this.pipeline.resolve.path(pathObject.dir);
                const output = path_1.default.format(pathObject);
                const rule = this.findRule(item.input);
                const asset = {
                    load_path: item.load_path,
                    input: path_2.cleanPath(input),
                    output: path_2.cleanPath(output),
                    cache: path_2.cleanPath(output)
                };
                // Handle rules for files
                if (!(this.pipeline.manifest.has(asset.input) && this.pipeline.manifest.get(asset.input).resolved)
                    && rule.file_rules
                    && rule.file_rules.length > 0) {
                    for (let i = 0; i < rule.file_rules.length; i++) {
                        const r = rule.file_rules[i];
                        if (!r.ignore && minimatch_1.default(asset.input, r.glob || asset.input)) {
                            asset.rule = r;
                            this.resolve(asset);
                        }
                    }
                    return;
                }
                asset.resolved = true;
                this.pipeline.manifest.set(asset);
            });
        });
    }
}
exports.DirectoryPipeline = DirectoryPipeline;
