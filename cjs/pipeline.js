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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
const file_list_1 = require("./file-list");
const resolver_1 = require("./resolver");
const path_1 = require("./path");
const transformer_1 = require("./transformer");
const emitter_1 = require("lol/js/emitter");
const logger_1 = require("./logger");
class Pipeline {
    constructor() {
        this.files = new file_list_1.FileList();
        this.rules = new transformer_1.Transformer();
        this.resolver = new resolver_1.Resolver();
        this.events = new emitter_1.Emitter();
        this._plugins = new Set();
        this._options = new Map();
    }
    get logging() {
        return logger_1.verbose();
    }
    set logging(value) {
        logger_1.verbose(value);
    }
    createPath(path) {
        return new path_1.PathBuilder(path);
    }
    fetch(forceResolve) {
        this.files.resolve(forceResolve);
        this.events.dispatch("resolved");
        const paths = this.rules.transform(this.files.entries);
        this.resolver.set(paths);
        this.events.dispatch("transformed");
    }
    options(key) {
        return this._options.get(key);
    }
    plugin(plugin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._plugins.has(plugin.name)) {
                return;
            }
            this._plugins.add(plugin.name);
            let options;
            const res = options = plugin.setup(this);
            if (res && typeof res === "object" && typeof res.then) {
                options = yield res;
            }
            if (options) {
                this._options.set(plugin.name, options);
            }
        });
    }
}
exports.Pipeline = Pipeline;
