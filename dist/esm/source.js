var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Path from "path";
import { PipelineManager } from "./pipeline";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { FileSystem } from "./file-system";
import { PathBuilder, normalize } from "./path";
import { guid } from "lol/js/string/guid";
export class SourceManager {
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
        path = normalize(path, "os");
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
export class Source {
    constructor(path, pid) {
        this.uuid = guid();
        const pipeline = PipelineManager.get(pid);
        this.path = new PathBuilder(path);
        this.fullpath = new PathBuilder(Path.isAbsolute(path) ?
            path :
            pipeline.cwd.join(path).os());
        this.file = new FilePipeline(pid, this.uuid);
        this.directory = new DirectoryPipeline(pid, this.uuid);
        this.fs = new FileSystem(pid, this.uuid);
    }
}
