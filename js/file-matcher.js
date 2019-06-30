"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("./utils/fs");
const array_1 = require("lol/utils/array");
class FileMatcher {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.load_paths = [];
    }
    get root_path() {
        return this.pipeline.root_path;
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
    getPaths() {
        return this.load_paths.slice(0);
    }
    getAbsoluteLoadPath(load_path) {
        return path_1.default.join(this.root_path, load_path);
    }
    fromLoadPath(load_path, path) {
        return path_1.default.join(this.root_path, load_path, path);
    }
    relativeToLoadPath(load_path, path) {
        return path_1.default.relative(path_1.default.join(this.root_path, load_path), path);
    }
    findLoadPath(path) {
        path = path_1.default.normalize(path);
        for (let i = 0; i < this.load_paths.length; i++) {
            const load_path = path_1.default.isAbsolute(path) ? this.getAbsoluteLoadPath(this.load_paths[i]) : this.load_paths[i];
            if (path.indexOf(load_path) > -1)
                return this.load_paths[i];
        }
        return null;
    }
    fetch(rules, type = "file") {
        const fetcher = this._fetcher(type);
        const globs = [];
        const ignores = [];
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            this.load_paths.forEach((load_path) => {
                if ("ignore" in rule && rule.ignore) {
                    ignores.push(this.fromLoadPath(load_path, rule.glob));
                }
                else {
                    globs.push(this.fromLoadPath(load_path, rule.glob));
                }
            });
        }
        const assets = fetcher(globs, ignores)
            .map((file) => {
            const load_path = this.findLoadPath(file);
            const input = this.relativeToLoadPath(load_path, file);
            return {
                load_path,
                input: input,
                output: input,
                cache: input,
                resolved: false
            };
        });
        return assets;
    }
    fetchDirs(rules) {
        return this.fetch(rules, "directory");
    }
    _fetcher(type = "file") {
        return function (globs, ignores) {
            try {
                if (type == "file") {
                    return fs_1.fetch(globs, ignores);
                }
                else {
                    return array_1.unique(fs_1.fetchDirs(globs, ignores));
                }
            }
            catch (e) { }
            return [];
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
    filterAndMap(items, cb) {
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
exports.FileMatcher = FileMatcher;
