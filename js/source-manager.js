"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./utils/path");
const path_2 = __importDefault(require("path"));
class SourceManager {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this._sources = [];
    }
    add(path) {
        path = path_1.cleanPath(path);
        if (this._sources.indexOf(path) == -1)
            this._sources.push(path);
    }
    has(path) {
        path = path_1.cleanPath(path);
        return this._sources.indexOf(path) > -1;
    }
    remove(path) {
        path = path_1.cleanPath(path);
        const index = this._sources.indexOf(path);
        if (index > -1)
            this._sources.splice(index, 1);
    }
    source_with(source, input, is_absolute = false) {
        input = path_1.cleanPath(input);
        if (is_absolute && !path_2.default.isAbsolute(source)) {
            source = path_2.default.join(this.pipeline.resolve.root, source);
        }
        else if (!is_absolute && path_2.default.isAbsolute(source)) {
            source = path_2.default.relative(this.pipeline.resolve.root, source);
        }
        input = path_2.default.join(source, input);
        return path_1.cleanPath(input);
    }
    all(is_absolute = false) {
        if (!is_absolute)
            return this._sources.slice(0);
        return this._sources.map((source) => {
            return path_1.cleanPath(path_2.default.join(this.pipeline.resolve.root, source));
        });
    }
    find_from(input, is_absolute = false) {
        if (path_2.default.isAbsolute(input))
            input = this.pipeline.resolve.relative(this.pipeline.resolve.root, input);
        input = path_1.cleanPath(input);
        for (let i = 0; i < this._sources.length; i++) {
            let source = this._sources[i];
            if (input.indexOf(source) > -1) {
                if (is_absolute) {
                    source = path_2.default.join(this.pipeline.resolve.root, source);
                }
                return path_1.cleanPath(source);
            }
        }
        return null;
    }
    forEach(items, cb) {
        this._sources.forEach((source) => {
            items.forEach((item) => {
                cb(item, source);
            });
        });
    }
    map(items, cb) {
        const new_items = [];
        this._sources.forEach((source) => {
            items.forEach((item) => {
                new_items.push(cb(item, source));
            });
        });
        return new_items;
    }
    filter(items, cb) {
        const new_items = [];
        this._sources.forEach((source) => {
            items.forEach((item) => {
                if (cb(item, source)) {
                    new_items.push(item);
                }
            });
        });
        return new_items;
    }
    filter_and_map(items, cb) {
        const new_items = [];
        this._sources.forEach((source) => {
            items.forEach((item) => {
                const result = cb(item, source);
                if (result)
                    new_items.push(result);
            });
        });
        return new_items;
    }
}
exports.SourceManager = SourceManager;
