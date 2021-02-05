import { fetch } from "lol/js/node/fs";
import { PathBuilder, PathOrString, toWebString } from "./path/path";

const PATH = new PathBuilder("")

export class FileList {
  entries: string[] = []
  protected filelist = {
    pending: true,
    include: [] as string[],
    exclude: [] as string[]
  }

  include(...patterns: PathOrString[]) {
    for (const pattern of patterns) {
      this._include(toWebString(pattern))
    }
    return this
  }

  exclude(...patterns: PathOrString[]) {
    for (const pattern of patterns) {
      this._exclude(toWebString(pattern))
    }
    return this
  }

  shadow(...patterns: PathOrString[]) {
    for (const pattern of patterns) {
      this._push(toWebString(pattern))
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
