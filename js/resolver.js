"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./utils/path");
const path_2 = __importDefault(require("path"));
class Resolver {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this._output = 'public';
        this._used = [];
        this._root = process.cwd();
        this.host = '';
    }
    set root(path) {
        if (!path_2.default.isAbsolute(path))
            throw new Error('Root must be absolute');
        this._root = path_1.cleanPath(path);
    }
    get root() {
        return this._root;
    }
    get output() {
        return this._output;
    }
    set output(path) {
        this._output = path_1.cleanPath(path);
    }
    output_with(path, is_absolute = true) {
        path = path_1.cleanPath(path);
        if (is_absolute) {
            path = path_2.default.join(this.root, this._output, path);
        }
        else {
            path = path_2.default.join(this._output, path);
        }
        return path_1.cleanPath(path);
    }
    relative(from, to) {
        from = path_1.cleanPath(from);
        if (path_2.default.isAbsolute(from))
            from = path_2.default.relative(this.root, from);
        to = path_1.cleanPath(to);
        if (path_2.default.isAbsolute(to))
            to = path_2.default.relative(this.root, to);
        return path_1.cleanPath(path_2.default.relative(from, to));
    }
    path(path, from = this.pipeline.tree.tree.path) {
        from = path_1.cleanPath(from);
        from = this.pipeline.tree.build(from);
        path = path_1.cleanPath(path);
        path = this.pipeline.tree.build(path);
        const fromTree = this.pipeline.tree.resolve(from);
        const output = this.relative(this.output_with(fromTree.path), this.output_with(path));
        this.use(path);
        return output;
    }
    url(path, from) {
        path = this.path(path, from);
        if (this.host) {
            const url = new URL(path, this.host);
            path = url.href;
        }
        return path;
    }
    clean_path(path, fromPath) {
        path = this.path(path, fromPath);
        return path_1.removeSearch(path);
    }
    clean_url(path, fromPath) {
        path = this.url(path, fromPath);
        return path_1.removeSearch(path);
    }
    asset(input) {
        return this.pipeline.manifest.get(input);
    }
    source(output, is_absolute = false, normalize = false) {
        output = path_1.cleanPath(output);
        const items = this.pipeline.manifest.all();
        let asset = null;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.output == output || item.cache == output) {
                asset = item;
                break;
            }
        }
        let input = output;
        if (asset)
            input = this.pipeline.source.source_with(asset.load_path, asset.input, is_absolute);
        input = path_1.cleanPath(input);
        return normalize ? path_2.default.normalize(input) : input;
    }
    normalize(path) {
        return path_2.default.normalize(path);
    }
    use(path) {
        path = path_1.cleanPath(path);
        if (this._used.indexOf(path) == -1) {
            this._used.push(path);
        }
    }
    is_used(path) {
        path = path_1.cleanPath(path);
        return this._used.indexOf(path) > -1;
    }
    clean_used() {
        this._used = [];
    }
    all_used() {
        return this._used.slice(0);
    }
}
exports.Resolver = Resolver;
