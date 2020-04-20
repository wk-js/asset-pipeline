"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./utils/path");
const path_2 = __importDefault(require("path"));
const file_pipeline_1 = require("./file-pipeline");
const directory_pipeline_1 = require("./directory-pipeline");
const file_system_1 = require("./file-system");
class SourceMap {
    constructor() {
        this._paths = new Map();
    }
    clone(source) {
        for (const [s, p] of this._paths) {
            const _source = source.add(s);
            _source.file.clone(p.file);
            _source.directory.clone(p.directory);
        }
    }
    add(path) {
        path = path_1.cleanPath(path);
        if (!this._paths.has(path)) {
            const source = new Source();
            source.path = path;
            source.file = new file_pipeline_1.FilePipeline(path);
            source.directory = new directory_pipeline_1.DirectoryPipeline(path);
            source.fs = new file_system_1.FileSystem(path);
            this._paths.set(path, source);
        }
        return this._paths.get(path);
    }
    get(path) {
        return this._paths.get(path);
    }
    has(path) {
        path = path_1.cleanPath(path);
        return this._paths.has(path);
    }
    remove(path) {
        if (this._paths.has(path)) {
            const item = this._paths.get(path);
            path = path_1.cleanPath(path);
            this._paths.delete(path);
            return item;
        }
    }
    paths(resolver, is_absolute = false) {
        const sources = [...this._paths.keys()];
        if (!is_absolute)
            return sources.slice(0);
        return sources.map((path) => {
            return path_1.cleanPath(path_2.default.join(resolver.root(), path));
        });
    }
    fetch(pipeline, type = "file") {
        for (const source of this._paths.values()) {
            source[type].fetch(pipeline);
        }
    }
    copy(pipeline) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const source of this._paths.values()) {
                yield source.fs.apply(pipeline);
            }
        });
    }
}
exports.SourceMap = SourceMap;
class Source {
    join(resolver, input, absolute = false) {
        let path = this.path;
        input = path_1.cleanPath(input);
        const root = resolver.root();
        if (absolute && !path_2.default.isAbsolute(path)) {
            path = path_2.default.join(root, path);
        }
        else if (!absolute && path_2.default.isAbsolute(path)) {
            path = path_2.default.relative(root, path);
        }
        input = path_2.default.join(path, input);
        return path_1.cleanPath(input);
    }
}
exports.Source = Source;
