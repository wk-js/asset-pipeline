"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = void 0;
const path_1 = require("./path/path");
const transform_rule_1 = require("./transform-rule");
const PATH = new path_1.PathBuilder("");
class Transformer {
    constructor() {
        this.saltKey = "";
        this.cachebreak = false;
        this.entries = [];
        this.results = [];
    }
    add(pattern) {
        const t = new transform_rule_1.TransformRule(path_1.toWebString(pattern));
        this.entries.push(t);
        return t;
    }
    delete(pattern) {
        const path = path_1.toWebString(pattern);
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
}
exports.Transformer = Transformer;
