import { PathBuilder, PathOrString, toWebString } from "./path";

export type UrlOrString = string | URLBuilder

export class URLBuilder {
  pathname: PathBuilder

  constructor(path: PathOrString, private _origin: string = "") {
    this.pathname = new PathBuilder(path)
  }

  set(url: UrlOrString) {
    try {
      const _url = toURLString(url)
      const u = new URL(_url)
      this._origin = u.origin
      this.setPathname(u.pathname)
    } catch (e) {
      this._origin = ""
      this.pathname.set("/")
    }

    return this
  }

  setOrigin(origin: UrlOrString) {
    try {
      const _origin = toURLString(origin)
      const u = new URL(this.pathname.unix(), _origin)
      this._origin = u.origin
      this.setPathname(u.pathname)
    } catch (e) {
      this._origin = ""
    }

    return this
  }

  setPathname(path: PathOrString) {
    this.pathname.set(path)
    return this
  }

  isValidURL() {
    try {
      new URL(this.pathname.toString("web"), this._origin)
      return true
    } catch (e) {
      return false
    }
  }

  clone() { return new URLBuilder(this.pathname.web(), this._origin) }

  join(...parts: PathOrString[]) {
    return new URLBuilder(this.pathname.join(...parts).web(), this._origin)
  }

  with(...parts: PathOrString[]) {
    return this.join(...parts)
  }

  relative(to: PathOrString) {
    return new URLBuilder(this.pathname.relative(to).web(), this._origin)
  }

  toString() {
    if (this.isValidURL()) {
      return this.toURL().href
    }
    return this.pathname.web()
  }

  toURL() {
    return new URL(this.pathname.toString("web"), this._origin)
  }
}

export function toURLString(pattern: UrlOrString): string {
  if (pattern instanceof URLBuilder) {
    return pattern.toString()
  } else {
    return toWebString(pattern)
  }
}

export function toURL(pattern: UrlOrString): URLBuilder {
  if (pattern instanceof URLBuilder) {
    return pattern
  } else {
    return new URLBuilder(pattern)
  }
}