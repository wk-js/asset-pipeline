import { fetch, copy, remove, move } from "./utils/fs";
import { AssetPipeline } from "./asset-pipeline";
import { relative } from "path";
import { reduce } from "when";
import { symlink, fetchDirs } from "./utils";

export class Manager {

  globs: any[] = []

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

  process() {
    return reduce(['move', 'copy', 'symlink'], (reduction:null, value:string) => {
      return this.apply( value )
    }, null)
  }

  apply(type:string) {
    const validGlobs = this.globs.filter((item) => {
      return item.action === type
    }).map(item => this.pipeline.fromLoadPath(item.glob))

    const ignoredGlobs = this.globs.filter((item) => {
      return item.action === 'ignore'
    }).map(item => this.pipeline.fromLoadPath(item.glob))

    const ios = (
      type === 'symlink' ?
      fetchDirs( validGlobs, ignoredGlobs )
      :
      fetch( validGlobs, ignoredGlobs )
    )
    .map(( file:string ) => {
      file = relative( this.pipeline.absolute_load_path, file )

      let input  = this.pipeline.fromLoadPath( file )
      let output = this.pipeline.fromDstPath( this.pipeline.tree.getPath( file ) )

      input  = relative( process.cwd(), input )
      output = relative( process.cwd(), output )

      return [ input, output.split('?')[0] ]
    })

    return reduce<any>( ios, (arr:null, io:string[]) => {
      if (type === 'copy') {
        return copy( io[0], io[1] )
      } else if (type === 'move') {
        return move( io[0], io[1] )
      } else if (type === 'symlink') {
        return symlink( io[0], io[1] )
      }
    }, null)
  }

}