import { fetch, copy, move, fetchDirs, symlink2 } from "./utils/fs";
import { Pipeline } from "./pipeline"
import { relative } from "path";

interface IManagerRuleItem {
  glob: string,
  action: "move" | "copy" | "symlink" | "ignore"
}

export class FileSystem {

  globs: IManagerRuleItem[] = []

  constructor(private pipeline: Pipeline) { }

  get load_paths() {
    return this.pipeline.load_paths
  }

  get resolver() {
    return this.pipeline.resolver
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

  async apply() {
    const types = ['move', 'copy', 'symlink']
    for (let i = 0; i < types.length; i++) {
      await this._apply(types[i])
    }
  }

  async _apply(type: string) {

    const validGlobs = this.load_paths.filter_and_map(this.globs, (item, load_path) => {
      if (item.action !== type) return false
      return this.load_paths.from_load_path(load_path, item.glob)
    })

    const ignoredGlobs = this.load_paths.filter_and_map(this.globs, (item, load_path) => {
      if (item.action !== 'ignore') return false
      return this.load_paths.from_load_path(load_path, item.glob)
    })

    const files = (
      type === 'symlink' ?
        fetchDirs(validGlobs, ignoredGlobs)
        :
        fetch(validGlobs, ignoredGlobs)
    )

    const ios = this.load_paths.filter_and_map(files, (file, load_path) => {
      const relative_file = this.load_paths.relative_to_load_path(load_path, file)

      // Future
      // Maybe copy only resolved files
      // this.pipeline.tree.is_resolved( relative_file )

      const input = relative(process.cwd(), file)

      let output = this.pipeline.fromDstPath(this.resolver.getPath(relative_file))
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