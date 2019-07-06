import { fetch, copy, move, fetchDirs, symlink2 } from "lol/js/node/fs";
import { Pipeline } from "./pipeline"
import { relative } from "path";

interface IManagerRuleItem {
  glob: string,
  action: "move" | "copy" | "symlink" | "ignore"
}

export class FileSystem {

  globs: IManagerRuleItem[] = []

  constructor(private pipeline: Pipeline) { }

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

  async apply() {
    const types = ['move', 'copy', 'symlink']
    for (let i = 0; i < types.length; i++) {
      await this._apply(types[i])
    }
  }

  protected async _apply(type: string) {

    const validGlobs = this.pipeline.source.filter_and_map(this.globs, (item, source) => {
      if (item.action !== type) return false
      return this.pipeline.source.with(source, item.glob, true)
    })

    const ignoredGlobs = this.pipeline.source.filter_and_map(this.globs, (item, source) => {
      if (item.action !== 'ignore') return false
      return this.pipeline.source.with(source, item.glob, true)
    })

    const files = (
      type === 'symlink' ?
        fetchDirs(validGlobs, ignoredGlobs)
        :
        fetch(validGlobs, ignoredGlobs)
    )

    const ios = this.pipeline.source.filter_and_map(files, (file, source) => {
      const relative_file = this.pipeline.resolve.relative(source, file)

      // Future
      // Maybe copy only resolved files
      // this.pipeline.tree.is_resolved( relative_file )

      const input = relative(process.cwd(), file)

      let output = this.pipeline.resolve.output_with(this.pipeline.resolve.path(relative_file))
      output = relative(process.cwd(), output)

      if (input == output) return false
      return [input, output.split(/\#|\?/)[0]]
    })

    for (let i = 0; i < ios.length; i++) {
      const io = ios[i];

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