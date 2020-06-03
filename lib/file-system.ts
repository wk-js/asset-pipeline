import { fetch, copy, move, fetchDirs, symlink2 } from "lol/js/node/fs";
import { Pipeline } from "./pipeline"
import { relative } from "path";
import { statSync } from 'fs';

export interface IManagerRuleItem {
  glob: string,
  action: "move" | "copy" | "symlink" | "ignore"
}

export class FileSystem {
  globs: IManagerRuleItem[] = []
  mtimes = new Map<string, Date>()

  constructor(private _source: string) { }

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
      fs.globs.push( glob )
    }
    return fs
  }

  async apply(pipeline: Pipeline, force = false) {
    if (force) this.mtimes.clear()
    const types = ['move', 'copy', 'symlink']
    for (let i = 0; i < types.length; i++) {
      await this._apply(pipeline, types[i])
    }
  }

  protected async _apply(pipeline: Pipeline, type: string) {
    const source = pipeline.source.get(this._source)
    if (!source) return
    const resolver = pipeline.resolve

    const validGlobs = this.globs
    .filter(glob => glob.action === type)
    .map(glob => source.join(pipeline.resolve, glob.glob, true))

    const ignoredGlobs = this.globs
    .filter(glob => glob.action === "ignore")
    .map(glob => source.join(pipeline.resolve, glob.glob, true))

    const files = (
      type === 'symlink' ?
        fetchDirs(validGlobs, ignoredGlobs)
        :
        fetch(validGlobs, ignoredGlobs)
    )

    let ios: [string, string][] = []
    files.forEach(file => {
      const relative_file = resolver.relative(source.path, file)
      const input = relative(resolver.root(), file)
      let output = resolver.output_with(resolver.path(relative_file))
      output = relative(resolver.root(), output)
      if (input !== output) {
        return ios.push([input, output.split(/\#|\?/)[0]])
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

    for (let i = 0; i < ios.length; i++) {
      const io = ios[i];

      pipeline.log(type, ...io)

      if (type === 'copy') {
        await copy(io[0], io[1])
      } else if (type === 'move') {
        await move(io[0], io[1])
      } else if (type === 'symlink') {
        await symlink2(io[0], io[1])
      }
    }
  }

}