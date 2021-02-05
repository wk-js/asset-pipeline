"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = void 0;
const path_1 = require("./path/path");
const transform_rule_1 = require("./transform-rule");
class Transformer {
    constructor() {
        this.saltKey = "";
        this.cachebreak = false;
        this.rules = [];
        this.results = [];
    }
    add(pattern) {
        const t = transform_rule_1.CreateTransformRule(path_1.toWebString(pattern));
        this.rules.push(t);
        return t;
    }
    delete(pattern) {
        const path = path_1.toWebString(pattern);
        const index = this.rules.findIndex(item => item.pattern === path);
        if (index > -1)
            this.rules.splice(index, 1);
    }
    transform(files) {
        const options = {
            saltKey: this.saltKey,
            cachebreak: this.cachebreak
        };
        const results = [];
        for (const filename of files) {
            const transforms = this.rules.filter(t => t.match(filename));
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
