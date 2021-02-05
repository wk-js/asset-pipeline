var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FileList } from "./file-list";
import { Resolver } from "./resolver";
import { PathBuilder } from "./path/path";
import { Transformer } from "./transformer";
import { Emitter } from "lol/js/emitter";
import { verbose } from "./logger";
export class Pipeline {
    constructor() {
        this.files = new FileList();
        this.rules = new Transformer();
        this.resolver = new Resolver();
        this.events = new Emitter();
        this._plugins = new Set();
        this._options = new Map();
    }
    get logging() {
        return verbose();
    }
    set logging(value) {
        verbose(value);
    }
    createPath(path) {
        return new PathBuilder(path);
    }
    fetch(forceResolve) {
        const files = this.files.resolve(forceResolve);
        this.events.dispatch("resolved", files);
        const paths = this.rules.transform(this.files.entries);
        this.resolver.set(paths);
        this.events.dispatch("transformed", paths);
    }
    options(key, value) {
        if (value) {
            this._options.set(key, value);
        }
        return this._options.get(key);
    }
    plugin(plugin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._plugins.has(plugin.name)) {
                return;
            }
            this._plugins.add(plugin.name);
            const res = plugin.setup(this);
            if (res && typeof res === "object" && typeof res.then) {
                yield res;
            }
        });
    }
}
