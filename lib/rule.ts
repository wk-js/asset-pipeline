import minimatch from "minimatch";
import { RuleBuilder, DefaultRule } from "./types";

export function createRule<Data, Methods>(desc: RuleBuilder<Data, Methods>): (pattern: string) => DefaultRule<Data> & Methods {
  return (pattern) => {
    const rule: DefaultRule = {
      pattern,

      options: {
        tag: "default",
        priority: 0,
        ...desc.data
      },

      tag(tag: string) {
        this.options.tag = tag
        return this
      },

      priority(priority: number) {
        this.options.priority = priority
        return this
      },

      clone() {
        const rr = createRule(desc)(this.pattern)
        rr.options = {
          ...rr.options,
          ...this.options
        }
        return rr
      },

      set(override) {
        Object.assign(this.options, override)
        return this
      },

      match(filename: string) {
        return minimatch(filename, this.pattern)
      },

      ...desc.methods
    }

    for (const [key, value] of Object.entries(rule)) {
      if (typeof value === "function") {
        // @ts-ignore
        rule[key] = value.bind(rule)
      }
    }

    return rule as DefaultRule<Data> & Methods
  }
}