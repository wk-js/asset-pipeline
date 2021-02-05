"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
const path_1 = require("./path/path");
const url_1 = require("./path/url");
const utils_1 = require("./path/utils");
class Resolver {
    constructor() {
        this.host = new url_1.URLBuilder("/");
        this.output = new path_1.PathBuilder("public");
        this._cwd = new path_1.PathBuilder(process.cwd());
        this._paths = [];
        this._aliases = [];
    }
    set(paths) {
        this._paths = paths.sort((a, b) => a[1].priority < b[1].priority ? -1 : 1);
    }
    alias(path) {
        this._aliases.push(path_1.toPath(path));
        return this;
    }
    resolve(path, tag = "default") {
        path = utils_1.normalize(path, "web");
        const original = path;
        const extra = path.match(/\#|\?/);
        let parameters = '';
        if (extra) {
            parameters = extra[0] + path.split(extra[0])[1];
            path = path.split(extra[0])[0];
        }
        const paths = [];
        for (const [filename, transformed] of this._paths) {
            if (path === filename && transformed.tag === tag) {
                paths.push({
                    transformed: transformed,
                    parameters
                });
            }
        }
        if (paths.length === 0) {
            for (const alias of this._aliases) {
                const p = alias.join(path).web();
                for (const [filename, transformed] of this._paths) {
                    if (p === filename && transformed.tag === tag) {
                        paths.push({
                            transformed: transformed,
                            parameters
                        });
                    }
                }
            }
        }
        if (paths.length === 0) {
            throw new Error(`Could not resolve "${original}"`);
        }
        return paths.reverse();
    }
    getTransformedPath(path, tag) {
        const paths = this.resolve(path, tag);
        return paths[0].transformed;
    }
    getPath(path, tag) {
        const resolved = this.resolve(path, tag)[0];
        path = resolved.transformed.path + resolved.parameters;
        return this.host.pathname.join(path).web();
    }
    getUrl(path, tag) {
        const resolved = this.resolve(path, tag)[0];
        path = resolved.transformed.path + resolved.parameters;
        return this.host.join(path).toString();
    }
    getOutputPath(path, tag) {
        const resolved = this.resolve(path, tag)[0];
        const _path = this._cwd.join(this.host.pathname, this.output, resolved.transformed.path);
        return this._cwd.relative(_path).web();
    }
    filter(predicate) {
        if (!predicate)
            return this._paths.slice(0);
        return this._paths.filter(predicate);
    }
}
exports.Resolver = Resolver;
