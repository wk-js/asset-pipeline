import { fetch, copy, move } from "./utils/fs";
import { AssetPipeline } from "./asset-pipeline";
import { relative, dirname, join, basename } from "path";
import { symlink, fetchDirs } from "./utils";

interface IManagerRuleItem {
  glob: string,
  action: "move" | "copy" | "symlink" | "ignore"
}

export class Manager {

  globs: IManagerRuleItem[] = []

  constructor(public pipeline:AssetPipeline) {}

  move(glob:string) {
    this.globs.push({
      glob: glob,
      action: 'move'
    })
  }

  copy(glob:string) {
    this.globs.push({
      glob: glob,
      action: 'copy'
    })
  }

  symlink(glob:string) {
    this.globs.push({
      glob: glob,
      action: 'symlink'
    })
  }

  ignore(glob:string) {
    this.globs.push({
      glob: glob,
      action: 'ignore'
    })
  }

  async process() {
    const types = ['move', 'copy', 'symlink']
    for (let i = 0; i < types.length; i++) {
      await this.apply( types[i] )
    }
  }

  async apply(type:string) {

    const validGlobs = this.pipeline.load_paths.filter_and_map(this.globs, (item, load_path) => {
      if (item.action !== type) return false
      return this.pipeline.load_paths.from_load_path(load_path, item.glob)
    })

    const ignoredGlobs = this.pipeline.load_paths.filter_and_map(this.globs, (item, load_path) => {
      if (item.action !== 'ignore') return false
      return this.pipeline.load_paths.from_load_path(load_path, item.glob)
    })

    const files = (
      type === 'symlink' ?
      fetchDirs( validGlobs, ignoredGlobs )
      :
      fetch( validGlobs, ignoredGlobs )
    )

    const ios = this.pipeline.load_paths.filter_and_map(files, (file, load_path) => {
      const relative_file = this.pipeline.load_paths.relative_to_load_path(load_path, file)

      // Future
      // Maybe copy only resolved files
      // this.pipeline.tree.is_resolved( relative_file )

      const input = relative( process.cwd(), file )

      let output = this.pipeline.fromDstPath( this.pipeline.tree.getPath( relative_file ) )
      output = relative( process.cwd(), output )

      if (input == output) return false
      return [ input, output.split(/\#|\?/)[0] ]
    })

    for (let i = 0; i < ios.length; i++) {
      const io = ios[i];

      if (type === 'copy') {
        await copy( io[0], io[1] )
      } else if (type === 'move') {
        await move( io[0], io[1] )
      } else if (type === 'symlink') {
        await symlink( io[0], io[1] )
      }
    }
  }

}