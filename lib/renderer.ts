import { AssetPipeline, AssetItemRules } from "./asset-pipeline";
import template from 'lodash.template';
import { createReadStream } from "fs";
import { MemoryStream } from "./utils/memory-stream";
import { guid } from "lol/utils/guid";
import { writeFile, editFile, EditFileCallback } from "./utils/fs";
import { TemplateOptions } from "lodash";
import { relative } from "path";

export class Renderer {

  options: TemplateOptions = {}

  constructor(public pipeline:AssetPipeline) {}

   async edit() {
    const inputs = this._fetch().filter((file) => {
      return typeof (file[2] as AssetItemRules).edit === 'function'
    })

    for (let i = 0; i < inputs.length; i++) {
      await editFile( inputs[i][1] as string, (inputs[i][2] as AssetItemRules).edit as EditFileCallback )
    }
  }

  async render() {
    const inputs = this._fetch().filter((item) => {
      return !!(item[2] as AssetItemRules).template
    })

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i] as any[];
      if (typeof input[1].template === 'object') {
        await this._render( input[1], input[2] )
      }
      await this._render( input[1] )
    }
  }

  private _render( output:string, data?:object ) { 
    return new Promise((resolve) => {
      const rs = createReadStream(output, { encoding: 'utf-8' })
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
    return this.pipeline.load_paths.map(Object.keys(this.pipeline.manifest.manifest.assets), (input, load_path) => {
      return [
        relative( process.cwd(), this.pipeline.load_paths.from_load_path( load_path , input) ),
        relative( process.cwd(), this.pipeline.fromDstPath(this.pipeline.tree.getPath( input )) ),
        this.pipeline.getFileRules( input )
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