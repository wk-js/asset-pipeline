import { AssetPipeline, GlobItem } from "./asset-pipeline";
import template from 'lodash.template';
import { createReadStream } from "fs";
import { MemoryStream } from "./utils/memory-stream";
import { guid } from "lol/utils/guid";
import { writeFile, editFile } from "./utils/fs";
import { promise, reduce } from "when";
import { TemplateOptions } from "lodash";
import { relative } from "path";

export class Renderer {

  options: TemplateOptions = {}

  constructor(public pipeline:AssetPipeline) {}

   edit() {
    const inputs = this._fetch().filter((file) => {
      return typeof (file[2] as GlobItem).edit === 'function'
    })

    return reduce(inputs, (reduction:any, input:any[]) => {
      return editFile( input[1], (input[2] as GlobItem).edit as ((value: string | Buffer) => string | Buffer) )
    }, null)
  }

  render() {
    const inputs = this._fetch().filter((template) => {
      return !!(template[2] as GlobItem).template
    })

    return reduce(inputs, (reduction:any, input:any[]) => {
      if (typeof input[1].template === 'object') {
        return this._render( input[0], input[1], input[2] )
      }
      return this._render( input[0], input[1] )
    }, null)
  }

  private _render( input:string, output:string, data?:object ) { 
    return promise((resolve) => {
      const rs = createReadStream(input, { encoding: 'utf-8' })
      const ws = new MemoryStream(guid())

      rs.on('data', ( chunk ) => {
        chunk = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk
        ws.write( this._renderSource(chunk, data) )
      })

      rs.on('end', () => {
        ws.end()
      })

      ws.on('finish', () => {
        writeFile( ws.getData('utf-8'), output )
        .then(resolve)
      })
    })
  }

  private _renderSource( src:string, data:object = {} ) {
    data = Object.assign({}, this.pipeline.data, data)
    return Renderer.render( src, this.options, data )
  }

  private _fetch() {
    return Object.keys(this.pipeline.manifest.manifest.ASSETS)

    .map((input) => {
      return [
        relative( process.cwd(), this.pipeline.fromLoadPath( input ) ),
        relative( process.cwd(), this.pipeline.fromDstPath(this.pipeline.tree.getPath( input )) ),
        this.pipeline.file.getRules( input )
      ]
    })
  }

  /**
   * Render
   *
   * @param {String} src
   * @param {Object} options
   * @param {Object} data
   */
  static render(src:string, options:TemplateOptions, data:object) {
    return template(src, options)(data)
  }

}