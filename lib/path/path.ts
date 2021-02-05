import * as Path from "path";
import { normalize } from "./utils";

export type PathOrString = string | PathBuilder

export class PathBuilder {
  private path: string

  constructor(path: PathOrString) {
    this.path = toOsString(path)
  }

  clone() { return new PathBuilder(this.path) }
  os() { return normalize(this.path, "os") }
  unix() { return normalize(this.path, "unix") }
  web() { return normalize(this.path, "web") }
  ext() { return Path.extname(this.path) }
  base() { return Path.basename(this.path) }
  name() { return Path.basename(this.path, this.ext()) }
  dir() { return Path.dirname(this.path) }
  set(path: PathOrString) {
    this.path = toUnixString(path)
    return this
  }

  isAbsolute() {
    return Path.isAbsolute(this.path)
  }

  join(...parts: PathOrString[]) {
    const _parts = parts.map(toUnixString)
    return new PathBuilder(Path.join(this.path, ..._parts))
  }

  with(...parts: PathOrString[]) {
    return this.join(...parts)
  }

  relative(to: PathOrString) {
    const _to = toUnixString(to)
    return new PathBuilder(Path.relative(this.path, _to))
  }

  toString(type: "unix" | "web" | "os" = "os") {
    return normalize(this.path, type)
  }
}

export function toUnixString(pattern: PathOrString): string {
  if (pattern instanceof PathBuilder) {
    return pattern.unix()
  } else {
    return normalize(pattern, "unix")
  }
}

export function toWebString(pattern: PathOrString): string {
  if (pattern instanceof PathBuilder) {
    return pattern.web()
  } else {
    return normalize(pattern, "web")
  }
}

export function toOsString(pattern: PathOrString): string {
  if (pattern instanceof PathBuilder) {
    return pattern.os()
  } else {
    return normalize(pattern, "os")
  }
}

export function toPath(pattern: PathOrString): PathBuilder {
  if (pattern instanceof PathBuilder) {
    return pattern
  } else {
    return new PathBuilder(pattern)
  }
}