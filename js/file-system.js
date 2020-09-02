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
exports.FileSystem = void 0;
const fs_1 = require("lol/js/node/fs");
const pipeline_1 = require("./pipeline");
const fs_2 = require("fs");
const path_1 = require("./path");
const Path = __importStar(require("path"));
class FileSystem {
    constructor(pid, sid) {
        this.pid = pid;
        this.sid = sid;
        this.globs = [];
        this.mtimes = new Map();
    }
    get source() {
        var _a;
        return (_a = pipeline_1.PipelineManager.get(this.pid)) === null || _a === void 0 ? void 0 : _a.source.get(this.sid);
    }
    get resolver() {
        var _a;
        return (_a = pipeline_1.PipelineManager.get(this.pid)) === null || _a === void 0 ? void 0 : _a.resolve;
    }
    move(glob) {
        this.globs.push({
            glob: glob,
            action: 'move'
        });
    }
    copy(glob) {
        this.globs.push({
            glob: glob,
            action: 'copy'
        });
    }
    symlink(glob) {
        this.globs.push({
            glob: glob,
            action: 'symlink'
        });
    }
    ignore(glob) {
        this.globs.push({
            glob: glob,
            action: 'ignore'
        });
    }
    clone(fs) {
        for (let i = 0; i < this.globs.length; i++) {
            const glob = this.globs[i];
            fs.globs.push(glob);
        }
        return fs;
    }
    apply(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (force)
                this.mtimes.clear();
            const types = ['move', 'copy', 'symlink'];
            for (let i = 0; i < types.length; i++) {
                yield this._apply(types[i]);
            }
        });
    }
    _apply(type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.resolver || !this.source)
                return;
            const resolver = this.resolver;
            const source = this.source;
            const validGlobs = this.globs
                .filter(glob => glob.action === type)
                .map(glob => source.fullpath.join(glob.glob).toWeb());
            const ignoredGlobs = this.globs
                .filter(glob => glob.action === "ignore")
                .map(glob => source.fullpath.join(glob.glob).toWeb());
            let files = (type === 'symlink' ?
                fs_1.fetchDirs(validGlobs, ignoredGlobs)
                :
                    fs_1.fetch(validGlobs, ignoredGlobs));
            let ios = [];
            files.forEach(file => {
                const relative_file = source.path.relative(file).toWeb();
                const input = source.fullpath.join(relative_file).toWeb();
                const output = resolver.output().with(resolver.getPath(relative_file));
                if (input !== output.toWeb()) {
                    return ios.push([input, path_1.cleanup(output.toWeb())]);
                }
            });
            ios = ios.filter(io => {
                const { mtime } = fs_2.statSync(io[0]);
                if (this.mtimes.has(io[0])) {
                    const prev = this.mtimes.get(io[0]);
                    if (mtime <= prev)
                        return false;
                }
                this.mtimes.set(io[0], mtime);
                return true;
            });
            const ps = ios.map(io => {
                this._log(type, ...io.map(p => path_1.normalize(Path.relative(process.cwd(), p), "web")));
                if (type === 'copy') {
                    return fs_1.copy(io[0], io[1]);
                }
                else if (type === 'move') {
                    return fs_1.move(io[0], io[1]);
                }
                else if (type === 'symlink') {
                    return fs_1.symlink2(io[0], io[1]);
                }
            });
            yield Promise.all(ps);
        });
    }
    _log(...args) {
        var _a;
        (_a = pipeline_1.PipelineManager.get(this.pid)) === null || _a === void 0 ? void 0 : _a.log(...args);
    }
}
exports.FileSystem = FileSystem;
