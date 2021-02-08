"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = void 0;
const minimatch_1 = __importDefault(require("minimatch"));
function createRule(desc) {
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
                return minimatch_1.default(filename, this.pattern);
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
exports.createRule = createRule;
