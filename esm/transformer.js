import { PathBuilder, toWebString } from "./path/path";
import { TransformRule } from "./transform-rule";
const PATH = new PathBuilder("");
export class Transformer {
    constructor() {
        this.saltKey = "";
        this.cachebreak = false;
        this.entries = [];
        this.results = [];
    }
    add(pattern) {
        const t = new TransformRule(toWebString(pattern));
        this.entries.push(t);
        return t;
    }
    delete(pattern) {
        const path = toWebString(pattern);
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
