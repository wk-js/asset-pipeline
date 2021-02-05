"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = void 0;
const minimatch_1 = __importDefault(require("minimatch"));
function createRule(desc) {
    return (pattern) => {
        const rule = Object.assign({ pattern, options: Object.assign({ tag: "default", priority: 0 }, desc.options), tag(tag) {
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
                return minimatch_1.default(filename, this.pattern);
            } }, desc.api);
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
