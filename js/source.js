"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = exports.SourceManager = void 0;
const Path = __importStar(require("path"));
const pipeline_1 = require("./pipeline");
const file_pipeline_1 = require("./file-pipeline");
const directory_pipeline_1 = require("./directory-pipeline");
const file_system_1 = require("./file-system");
const path_1 = require("./path");
const guid_1 = require("lol/js/string/guid");
class SourceManager {
    constructor(pid) {
        this.pid = pid;
        this._sources = new Map();
        const source = new Source("__shadow__", this.pid);
        source.uuid = "__shadow__";
        this._sources.set(source.uuid, source);
    }
    /**
     * Clone SourceMananger
     */
    clone(source) {
        for (const [s, p] of this._sources) {
            const _source = source.add(s);
            _source.file.clone(p.file);
            _source.directory.clone(p.directory);
            _source.fs.clone(p.fs);
        }
    }
    /**
     * Add a new source path, relative to cwd
     */
    add(path) {
        path = path_1.normalize(path, "os");
        if (Path.isAbsolute(path))
            throw new Error("Cannot an absolute path to source");
        const source = new Source(path, this.pid);
        this._sources.set(source.uuid, source);
        return source;
    }
    /**
     * Get the source object from source uuid
     */
    get(uuid) {
        return this._sources.get(uuid);
    }
    /**
     * Check source exists
     */
    has(uuid) {
        return this._sources.has(uuid);
    }
    /**
     * Remove source
     */
    remove(uuid) {
        if (this._sources.has(uuid)) {
            const item = this._sources.get(uuid);
            this._sources.delete(uuid);
            return item;
        }
    }
    all(type = "array") {
        switch (type) {
            case "array": return [...this._sources.values()];
            case "object": {
                const o = {};
                for (const source of this._sources.values()) {
                    o[source.uuid] = source;
                }
                return o;
            }
        }
    }
    fetch(type) {
        for (const source of this._sources.values()) {
            source[type].fetch();
        }
    }
    copy(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const source of this._sources.values()) {
                yield source.fs.apply(force);
            }
        });
    }
}
exports.SourceManager = SourceManager;
class Source {
    constructor(path, pid) {
        this.uuid = guid_1.guid();
        const pipeline = pipeline_1.PipelineManager.get(pid);
        this.path = new path_1.PathBuilder(path);
        this.fullpath = new path_1.PathBuilder(Path.isAbsolute(path) ?
            path :
            pipeline.cwd.join(path).os());
        this.file = new file_pipeline_1.FilePipeline(pid, this.uuid);
        this.directory = new directory_pipeline_1.DirectoryPipeline(pid, this.uuid);
        this.fs = new file_system_1.FileSystem(pid, this.uuid);
    }
}
exports.Source = Source;
