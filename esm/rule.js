import minimatch from "minimatch";
export function createRule(desc) {
    return (pattern) => {
        const rule = Object.assign({ pattern, options: Object.assign({ tag: "default", priority: 0 }, desc.data), tag(tag) {
                this.options.tag = tag;
                return this;
            },
            priority(priority) {
                this.options.priority = priority;
                return this;
            },
            clone() {
                const rr = createRule(desc)(this.pattern);
                rr.options = Object.assign(Object.assign({}, rr.options), this.options);
                return rr;
            }, set(override) {
                Object.assign(this.options, override);
                return this;
            }, match(filename) {
                return minimatch(filename, this.pattern);
            } }, desc.methods);
        for (const [key, value] of Object.entries(rule)) {
            if (typeof value === "function") {
                // @ts-ignore
                rule[key] = value.bind(rule);
            }
        }
        return rule;
    };
}
