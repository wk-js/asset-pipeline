import { toWebString } from "./path/path";
import { CreateTransformRule } from "./transform-rule";
export class Transformer {
    constructor() {
        this.saltKey = "";
        this.cachebreak = false;
        this.rules = [];
        this.results = [];
    }
    add(pattern) {
        const t = CreateTransformRule(toWebString(pattern));
        this.rules.push(t);
        return t;
    }
    delete(pattern) {
        const path = toWebString(pattern);
        const index = this.rules.findIndex(item => item.pattern === path);
        if (index > -1)
            this.rules.splice(index, 1);
    }
    match(filename) {
        const _filename = toWebString(filename);
        return this.rules.some(t => t.match(_filename));
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
