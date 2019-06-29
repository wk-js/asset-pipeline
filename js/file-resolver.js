"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("./utils/fs");
const array_1 = require("lol/utils/array");
class Resolver {
    constructor() {
        this.root_path = process.cwd();
        this.load_paths = [];
    }
    add(path) {
        if (!this.has(path))
            this.load_paths.push(path);
    }
    has(path) {
        return this.load_paths.indexOf(path) > -1;
    }
    remove(path) {
        const index = this.load_paths.indexOf(path);
        if (index > -1)
            this.load_paths.splice(index, 1);
    }
    get_paths() {
        return this.load_paths.slice(0);
    }
    absolute_load_path(load_path) {
        return path_1.default.join(this.root_path, load_path);
    }
    from_load_path(load_path, path) {
        return path_1.default.join(this.root_path, load_path, path);
    }
    relative_to_load_path(load_path, path) {
        return path_1.default.relative(path_1.default.join(this.root_path, load_path), path);
    }
    fetch(rules, type = "file") {
        const fetcher = this._fetcher(type);
        const assets = this.load_paths.map((load_path) => {
            const globs = [];
            const ignores = [];
            rules.forEach((rule) => {
                if ("ignore" in rule && rule.ignore) {
                    ignores.push(this.from_load_path(load_path, rule.glob));
                }
                else {
                    globs.push(this.from_load_path(load_path, rule.glob));
                }
            });
            return fetcher(globs, ignores)
                .map((file) => {
                const input = this.relative_to_load_path(load_path, file);
                return {
                    load_path,
                    input: input,
                    output: input,
                    cache: input
                };
            });
        });
        return Array.prototype.concat.apply([], assets);
    }
    fetchDirs(rules) {
        return this.fetch(rules, "directory");
    }
    _fetcher(type = "file") {
        return function (globs, ignores) {
            if (type == "file") {
                return fs_1.fetch(globs, ignores);
            }
            else {
                return array_1.unique(fs_1.fetchDirs(globs, ignores));
            }
        };
    }
    forEach(items, cb) {
        items.forEach((item) => {
            this.load_paths.forEach((load_path) => {
                cb(item, load_path);
            });
        });
    }
    map(items, cb) {
        const new_items = [];
        items.forEach((item) => {
            this.load_paths.forEach((load_path) => {
                new_items.push(cb(item, load_path));
            });
        });
        return new_items;
    }
    filter(items, cb) {
        const new_items = [];
        items.forEach((item) => {
            this.load_paths.forEach((load_path) => {
                if (cb(item, load_path)) {
                    new_items.push(item);
                }
            });
        });
        return new_items;
    }
    filter_and_map(items, cb) {
        const new_items = [];
        items.forEach((item) => {
            this.load_paths.forEach((load_path) => {
                const result = cb(item, load_path);
                if (result)
                    new_items.push(result);
            });
        });
        return new_items;
    }
}
exports.Resolver = Resolver;
