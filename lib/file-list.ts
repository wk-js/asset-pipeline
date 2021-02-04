import { fetch } from "lol/js/node/fs";
import { PathBuilder } from "./path";

const PATH = new PathBuilder("")

export class FileList {
  entries: string[] = []
  protected filelist = {
    pending: true,
    include: [] as string[],
    exclude: [] as string[]
  }

  include(...patterns: (string | PathBuilder)[]) {
    for (const pattern of patterns) {
      this._include(this._toUnixPath(pattern))
    }
    return this
  }

  exclude(...patterns: (string | PathBuilder)[]) {
    for (const pattern of patterns) {
      this._exclude(this._toUnixPath(pattern))
    }
    return this
  }

  shadow(...patterns: (string | PathBuilder)[]) {
    for (const pattern of patterns) {
      this._push(this._toUnixPath(pattern))
    }
    return this
  }

  resolve(force = false) {
    if (force) this.filelist.pending = true
    if (this.filelist.pending) {
      const files = fetch(this.filelist.include, this.filelist.exclude)
      for (const file of files) {
        this._push(file)
      }
    }
    return this.entries.slice(0)
  }

  protected _toUnixPath(pattern: string | PathBuilder): string {
    if (pattern instanceof PathBuilder) {
      return pattern.unix()
    } else {
      return PATH.set(pattern).unix()
    }
  }

  protected _push(file: string) {
    const f = PATH.set(file).web()
    if (!this.entries.includes(f)) {
      this.entries.push(f)
    }
  }

  protected _include(pattern: string) {
    this.filelist.include.push(PATH.set(pattern).unix())
  }

  protected _exclude(pattern: string) {
    this.filelist.exclude.push(PATH.set(pattern).unix())
  }

}


