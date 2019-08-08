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
    clone(resolve) {
        resolve.host = this.host;
        resolve.root(this._root);
        resolve.output(this._output);
    }
    root(path) {
        if (path) {
            if (!path_2.default.isAbsolute(path))
                throw new Error('Root must be absolute');
            this._root = path_1.cleanPath(path);
        }
        return this._root;
    }
    root_with(path) {
        path = path_2.default.join(this._root, path_1.cleanPath(path));
        return path_1.cleanPath(path);
    }
    output(path) {
        if (path)
            this._output = path_1.cleanPath(path);
        return this._output;
    }
    output_with(path, absolute = true) {
        path = path_1.cleanPath(path);
        if (absolute) {
            path = path_2.default.join(this._root, this._output, path);
        }
        else {
            path = path_2.default.join(this._output, path);
        }
        return path_1.cleanPath(path);
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
        const host = this.host ? this.host : "https://localhost";
        const url = new URL(path, host);
        return this.host ? url.href : url.pathname + url.search;
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
        const asset = (() => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.output == output || item.cache == output) {
                    return item;
                }
            }
        })();
        let input = output;
        if (asset)
            input = this.pipeline.source.with(asset.source, asset.input, is_absolute);
        input = path_1.cleanPath(input);
        return normalize ? path_2.default.normalize(input) : input;
    }
    parse(path) {
        const root = this._root;
        const is_absolute = path_2.default.isAbsolute(path);
        // Build relative path
        let relative = path;
        if (is_absolute)
            relative = path_2.default.relative(root, path);
        // Build full path
        const full = path_2.default.join(root, relative);
        // Clean paths
        const result = {
            relative: path_1.cleanPath(relative),
            full: path_1.cleanPath(full)
        };
        // Looking for source
        const source = this.pipeline.source.find_from_input(result.relative);
        // Build key and clean paths
        if (source) {
            result.source = path_1.cleanPath(source);
            result.key = path_1.cleanPath(path_2.default.relative(source, result.relative));
        }
        return result;
    }
    relative(from, to) {
        from = path_1.cleanPath(from);
        if (path_2.default.isAbsolute(from))
            from = path_2.default.relative(this._root, from);
        to = path_1.cleanPath(to);
        if (path_2.default.isAbsolute(to))
            to = path_2.default.relative(this._root, to);
        return path_1.cleanPath(path_2.default.relative(from, to));
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
