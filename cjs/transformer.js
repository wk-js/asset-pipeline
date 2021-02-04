"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = void 0;
const path_1 = require("./path");
const rule_1 = require("./rule");
const PATH = new path_1.PathBuilder("");
class Transformer {
    constructor() {
        this.saltKey = "";
        this.cachebreak = false;
        this.entries = [];
        this.results = [];
    }
    add(pattern) {
        const path = this._toWebPath(pattern);
        const t = new rule_1.RuleBuilder(path);
        this.entries.push(t);
        return t;
    }
    delete(pattern) {
        const path = this._toWebPath(pattern);
        const index = this.entries.findIndex(item => item.pattern === path);
        if (index > -1)
            this.entries.splice(index, 1);
    }
    transform(files) {
        const options = {
            saltKey: this.saltKey,
            cachebreak: this.cachebreak
        };
        const results = [];
        for (const filename of files) {
            const transforms = this.entries
                .filter(t => t.match(filename))
                .sort((a, b) => a.priority < b.priority ? -1 : 1);
            if (transforms.length > 0) {
                for (const transform of transforms) {
                    const result = transform.apply(filename, options);
                    results.push([filename, result]);
                }
            }
            else {
                results.push([filename, { path: filename, tag: "default", priority: 0 }]);
            }
        }
        return this.results = results;
    }
    _toWebPath(pattern) {
        if (pattern instanceof path_1.PathBuilder) {
            return pattern.web();
        }
        else {
            return PATH.set(pattern).web();
        }
    }
}
exports.Transformer = Transformer;
