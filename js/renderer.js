"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_template_1 = __importDefault(require("lodash.template"));
const fs_1 = require("fs");
const memory_stream_1 = require("./utils/memory-stream");
const guid_1 = require("lol/utils/guid");
const fs_2 = require("./utils/fs");
const path_1 = require("path");
class Renderer {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.options = {};
    }
    edit() {
        return __awaiter(this, void 0, void 0, function* () {
            const inputs = this._fetch().filter((file) => {
                return typeof file[2].edit === 'function';
            });
            for (let i = 0; i < inputs.length; i++) {
                yield fs_2.editFile(inputs[i][1], inputs[i][2].edit);
            }
        });
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            const inputs = this._fetch().filter((item) => {
                return !!item[2].template;
            });
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                if (typeof input[1].template === 'object') {
                    yield this._render(input[1], input[2]);
                }
                yield this._render(input[1]);
            }
        });
    }
    _render(output, data) {
        return new Promise((resolve) => {
            const rs = fs_1.createReadStream(output, { encoding: 'utf-8' });
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
        return this.pipeline.load_paths.map(Object.keys(this.pipeline.manifest.manifest.assets), (input, load_path) => {
            return [
                path_1.relative(process.cwd(), this.pipeline.load_paths.from_load_path(load_path, input)),
                path_1.relative(process.cwd(), this.pipeline.fromDstPath(this.pipeline.tree.getPath(input))),
                this.pipeline.getFileRules(input)
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
