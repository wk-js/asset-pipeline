import minimatch from "minimatch";
import { basename, dirname, format, join, parse, relative } from "path";
import { generateHash } from "./utils";
import { normalize } from "./path";
import { Rule, RuleOptions, TransformedPath } from "./types";

const EXT_REG = /^\./

export class RuleBuilder {
  rule: Rule = {
    tag: "default",
    priority: 0,
    cachebreak: true
  }

  constructor(public pattern: string) {}

  path(path: string) {
    this.directory(dirname(path))
    const parts = basename(path).split(".")
    const name = parts.shift()
    const extension = parts.join(".")
    if (name) this.name(name)
    if (extension) this.extension(`.${extension}`)
    return this
  }

  name(name: string) {
    this.rule.name = name
    return this
  }

  extension(extension: string) {
    if (!EXT_REG.test(extension)) {
      extension = `.${extension}`
    }
    this.rule.extension = extension
    return this
  }

  directory(directory: string) {
    this.rule.directory = directory
    return this
  }

  baseDirectory(baseDirectory: string) {
    this.rule.baseDirectory = baseDirectory
    return this
  }

  relative(relative: string) {
    this.rule.relative = relative
    return this
  }

  keepDirectory(enable: boolean) {
    if (enable) {
      delete this.rule.directory
    } else {
      this.rule.directory = "."
    }
    return this
  }

  cachebreak(enable: boolean) {
    this.rule.cachebreak = enable
    return this
  }

  priority(value: number) {
    this.rule.priority = value
    return this
  }

  tag(tag: string) {
    this.rule.tag = tag
    return this
  }

  match(filename: string) {
    return minimatch(filename, this.pattern)
  }

  apply(filename: string, options?: Partial<RuleOptions>): TransformedPath {
    const _options: RuleOptions = {
      cachebreak: false,
      saltKey: "none",
      ...(options || {})
    }

    const rule = this.rule
    let output = filename

    const hash = generateHash(output + _options.saltKey)
    const parsed = parse(output)

    // Fix ext and name
    const parts = parsed.base.split(".")
    const name = parts.shift()!
    parsed.name = name
    parsed.ext = `.${parts.join(".")}`

    if (typeof rule.directory === "string" && rule.directory) {
      parsed.dir = rule.directory
    }

    if (typeof rule.relative === "string" && rule.relative) {
      parsed.dir = relative(rule.relative, parsed.dir)
    }

    if (typeof rule.baseDirectory === "string" && rule.baseDirectory) {
      parsed.dir = join(rule.baseDirectory, parsed.dir)
    }

    if (typeof rule.name === "string" && rule.name) {
      parsed.name = rule.name
    }

    if (_options.cachebreak && rule.cachebreak) {
      parsed.name = `${parsed.name}-${hash}`
    }

    if (typeof rule.extension === "string" && rule.extension) {
      parsed.ext = rule.extension
    }

    parsed.base = parsed.name + parsed.ext

    output = format(parsed)

    return {
      path: normalize(output, "web"),
      tag: rule.tag,
      priority: rule.priority
    }
  }

}