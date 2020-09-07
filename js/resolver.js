"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
const path_1 = __importDefault(require("path"));
const pipeline_1 = require("./pipeline");
const path_2 = require("./path");
class Resolver {
    constructor(pid) {
        this.pid = pid;
        this.host = '';
        this.output("public");
    }
    get pipeline() {
        return pipeline_1.PipelineManager.get(this.pid);
    }
    get source() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.source;
    }
    get manifest() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.manifest;
    }
    get tree() {
        var _a;
        return (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.tree;
    }
    clone(resolve) {
        resolve.host = this.host;
        resolve.output('public');
    }
    output(path) {
        if (path) {
            if (path_1.default.isAbsolute(path)) {
                this._output = path_2.createWrapper(path);
            }
            else {
                this._output = path_2.createWrapper(path_1.default.join(process.cwd(), path));
            }
        }
        return this._output;
    }
    getPath(path, options) {
        if (!path)
            throw new Error("[asset-pipeline][Resolver] path cannot be empty");
        if (!this.tree)
            return path;
        const tree = this.tree;
        const opts = Object.assign({
            from: tree.tree.path,
            cleanup: false,
        }, options || {});
        opts.from = tree.build(opts.from);
        path = tree.build(path);
        const fromTree = tree.resolve(opts.from);
        const output = this._output.with(fromTree.path)
            .relative(this._output.with(path).raw());
        if (opts.cleanup) {
            return path_2.cleanup(output.toWeb());
        }
        return output.toWeb();
    }
    getUrl(path, options) {
        path = this.getPath(path, options);
        if (this.host) {
            try {
                const url = new URL(path, this.host);
                return url.href;
            }
            catch (e) {
                return path_1.default.join(this.host, path);
            }
        }
        return path;
    }
    /**
     * Looking for source from a path by checking base directory
     */
    findSource(path) {
        if (!this.source || !this.manifest)
            return;
        const source = this.source;
        const manifest = this.manifest;
        const sources = source.all();
        const source_paths = sources.map(p => {
            if (path_1.default.isAbsolute(path)) {
                return p.fullpath.toWeb();
            }
            return p.path.toWeb();
        });
        path = path_2.normalize(path, "web");
        const dir = [];
        const parts = path.split("/");
        for (const part of parts) {
            dir.push(part);
            const dir_path = path_2.normalize(dir.join("/"), "web");
            const index = source_paths.indexOf(dir_path);
            if (index > -1) {
                const key = sources[index].path.relative(path).toWeb();
                if (manifest.has(key))
                    return sources[index];
            }
        }
    }
    /**
     * Looking for a source and
     */
    parse(path) {
        // Build relative path
        let relative = path_2.createWrapper(path);
        if (path_1.default.isAbsolute(path)) {
            relative = path_2.createWrapper(path_1.default.relative(process.cwd(), path));
        }
        // Clean paths
        const result = {
            relative: relative.toWeb(),
        };
        // Looking for source
        const source = this.findSource(result.relative);
        // Build key and clean paths
        if (source) {
            result.source = source.path.toWeb();
            result.key = source.path.relative(result.relative).toWeb();
            result.full = source.fullpath.join(result.key).toWeb();
        }
        return result;
    }
    getInputFromOutput(output, absolute = false) {
        if (!this.source)
            return;
        const asset = this.getAssetFromOutput(output);
        if (!asset)
            return;
        const source = this.source.get(asset.source.uuid);
        if (!source)
            return;
        if (absolute) {
            return source.fullpath.join(asset.input).toWeb();
        }
        return source.path.join(asset.input).toWeb();
    }
    getAssetFromOutput(output) {
        if (!this.manifest)
            return;
        const assets = this.manifest.export();
        for (let i = 0; i < assets.length; i++) {
            const item = assets[i];
            if (item.output == output || item.cache == output) {
                return item;
            }
        }
    }
}
exports.Resolver = Resolver;
