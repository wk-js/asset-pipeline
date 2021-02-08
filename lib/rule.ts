import minimatch from "minimatch";
import { RuleBuilder, DefaultRule } from "./types";

export function createRule<Options, Methods>(desc: RuleBuilder<Options, Methods>): (pattern: string) => DefaultRule<Options> & Methods {
  return (pattern) => {
    let rule: DefaultRule<any> = {
      pattern,

      options: {
        tag: "default",
        priority: 0,
      },

      tag(tag: string) {
        this.options.tag = tag
        return this
      },

      priority(priority: number) {
        this.options.priority = priority
        return this
      },

      set(override) {
        Object.assign(this.options, override)
        return this
      },

      match(filename: string) {
        return minimatch(filename, this.pattern)
      },
    }

    if (desc.options && typeof desc.options === "function") {
      rule.options = {
        ...rule.options,
        ...desc.options(),
      }
    }

    if (desc.methods && typeof desc.methods === "object") {
      rule = {
        ...rule,
        ...desc.methods
      }
    }

    for (const [key, value] of Object.entries(rule)) {
      if (typeof value === "function") {
        // @ts-ignore
        rule[key] = value.bind(rule)
      }
    }

    return rule as DefaultRule<Options> & Methods
  }
}