import { fetch, copy, move, fetchDirs, symlink2 } from "lol/js/node/fs";
import { PipelineManager } from "./pipeline"
import { statSync } from 'fs';
import { cleanup, normalize } from "./path";
import * as Path from "path";
import { chunk } from "lol/js/array";

export interface IManagerRuleItem {
  glob: string,
  action: "move" | "copy" | "symlink" | "ignore"
}

export class FileSystem {
  chunkCount = 15
  private globs: IManagerRuleItem[] = []
  private mtimes = new Map<string, Date>()

  constructor(private pid: string, private sid: string) { }

  get source() {
    return PipelineManager.get(this.pid)?.source.get(this.sid)
  }

  get resolver() {
    return PipelineManager.get(this.pid)?.resolve
  }

  move(glob: string) {
    this.globs.push({
      glob: glob,
      action: 'move'
    })
  }

  copy(glob: string) {
    this.globs.push({
      glob: glob,
      action: 'copy'
    })
  }

  symlink(glob: string) {
    this.globs.push({
      glob: glob,
      action: 'symlink'
    })
  }

  ignore(glob: string) {
    this.globs.push({
      glob: glob,
      action: 'ignore'
    })
  }

  clone(fs: FileSystem) {
    for (let i = 0; i < this.globs.length; i++) {
      const glob = this.globs[i];
      fs.globs.push(glob)
    }
    return fs
  }

  async apply(force = false) {
    if (force) this.mtimes.clear()
    const types = ['move', 'copy', 'symlink']
    for (let i = 0; i < types.length; i++) {
      await this._apply(types[i])
    }
  }

  protected async _apply(type: string) {
    if (!this.resolver || !this.source) return

    const resolver = this.resolver
    const source = this.source

    const validGlobs = this.globs
      .filter(glob => glob.action === type)
      .map(glob => source.fullpath.join(glob.glob).toWeb())

    const ignoredGlobs = this.globs
      .filter(glob => glob.action === "ignore")
      .map(glob => source.fullpath.join(glob.glob).toWeb())

    let files = (
      type === 'symlink' ?
        fetchDirs(validGlobs, ignoredGlobs)
        :
        fetch(validGlobs, ignoredGlobs)
    )

    let ios: [string, string][] = []
    files.forEach(file => {
      const relative_file = source.path.relative(file).toWeb()
      const input = source.fullpath.join(relative_file).toWeb()
      const output = resolver.output().with(resolver.getPath(relative_file))
      if (input !== output.toWeb()) {
        return ios.push([input, cleanup(output.toWeb())])
      }
    })


    ios = ios.filter(io => {
      const { mtime } = statSync(io[0])

      if (this.mtimes.has(io[0])) {
        const prev = this.mtimes.get(io[0])!
        if (mtime <= prev) return false
      }

      this.mtimes.set(io[0], mtime)
      return true
    })


    for (const items of chunk(ios, this.chunkCount)) {
      const ps = items.map(io => {
        this._log(type, ...io.map(p => normalize(Path.relative(process.cwd(), p), "web")))

        if (type === 'copy') {
          return copy(io[0], io[1])
        } else if (type === 'move') {
          return move(io[0], io[1])
        } else if (type === 'symlink') {
          return symlink2(io[0], io[1])
        }
      })

      await Promise.all(ps)
    }

  }

  private _log(...args: any[]) {
    PipelineManager.get(this.pid)?.log(...args)
  }

}