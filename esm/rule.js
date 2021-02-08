import minimatch from "minimatch";
export function createRule(desc) {
    return (pattern) => {
        let rule = {
            pattern,
            options: {
                tag: "default",
                priority: 0,
            },
            tag(tag) {
                this.options.tag = tag;
                return this;
            },
            priority(priority) {
                this.options.priority = priority;
                return this;
            },
            set(override) {
                Object.assign(this.options, override);
                return this;
            },
            match(filename) {
                return minimatch(filename, this.pattern);
            },
        };
        if (desc.options && typeof desc.options === "function") {
            rule.options = Object.assign(Object.assign({}, rule.options), desc.options());
        }
        if (desc.methods && typeof desc.methods === "object") {
            rule = Object.assign(Object.assign({}, rule), desc.methods);
        }
        for (const [key, value] of Object.entries(rule)) {
            if (typeof value === "function") {
                // @ts-ignore
                rule[key] = value.bind(rule);
            }
        }
        return rule;
    };
}
