"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_template_1 = __importDefault(require("lodash.template"));
const fs_1 = require("fs");
const memory_stream_1 = require("./utils/memory-stream");
const guid_1 = require("lol/utils/guid");
const fs_2 = require("./utils/fs");
const when_1 = require("when");
const path_1 = require("path");
class Renderer {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.options = {};
    }
    edit() {
        const inputs = this._fetch().filter((file) => {
            return typeof file[2].edit === 'function';
        });
        return when_1.reduce(inputs, (reduction, input) => {
            return fs_2.editFile(input[1], input[2].edit);
        }, null);
    }
    render() {
        const inputs = this._fetch().filter((template) => {
            return !!template[2].template;
        });
        return when_1.reduce(inputs, (reduction, input) => {
            if (typeof input[1].template === 'object') {
                return this._render(input[0], input[1], input[2]);
            }
            return this._render(input[0], input[1]);
        }, null);
    }
    _render(input, output, data) {
        return when_1.promise((resolve) => {
            const rs = fs_1.createReadStream(input, { encoding: 'utf-8' });
            const ws = new memory_stream_1.MemoryStream(guid_1.guid());
            rs.on('data', (chunk) => {
                chunk = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
                ws.write(this._renderSource(chunk, data));
            });
            rs.on('end', () => {
                ws.end();
            });
            ws.on('finish', () => {
                fs_2.writeFile(ws.getData('utf-8'), output)
                    .then(resolve);
            });
        });
    }
    _renderSource(src, data = {}) {
        data = Object.assign({}, this.pipeline.data, data);
        return Renderer.render(src, this.options, data);
    }
    _fetch() {
        return Object.keys(this.pipeline.manifest.manifest.ASSETS)
            .map((input) => {
            return [
                path_1.relative(process.cwd(), this.pipeline.fromLoadPath(input)),
                path_1.relative(process.cwd(), this.pipeline.fromDstPath(this.pipeline.tree.getPath(input))),
                this.pipeline.file.getRules(input)
            ];
        });
    }
    /**
     * Render
     *
     * @param {String} src
     * @param {Object} options
     * @param {Object} data
     */
    static render(src, options, data) {
        return lodash_template_1.default(src, options)(data);
    }
}
exports.Renderer = Renderer;
