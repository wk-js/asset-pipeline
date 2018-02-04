import { AssetPipeline, GlobItem, AlternativeOutputs, AssetItem } from "./asset-pipeline";
import { fetch } from 'wkt/js/api/file/utils';
import { join, normalize, relative, basename, extname, dirname, parse, format } from "path";
import minimatch from 'minimatch';
import { hashCache, versionCache } from "./cache";

export class FilePipeline {

  protected _globs: GlobItem[] = []

  constructor(public pipeline:AssetPipeline) {}

  get manifest() {
    return this.pipeline.manifest.manifest
  }

  add(glob:string, parameters:GlobItem) {
    glob = this.pipeline.fromLoadPath(normalize(glob))

    parameters = Object.assign({
      glob: glob
    }, parameters || {})

    this._globs.push( parameters )
  }

  ignore(glob:string) {
    glob = this.pipeline.fromLoadPath(normalize(glob))

    const parameters = {
      glob: glob,
      ignore: true
    }

    this._globs.push( parameters )
  }

  fetch() {
    const globs:   string[] = []
    const ignores: string[] = []

    this._globs.forEach((item) => {
      if ("ignore" in item && item.ignore) {
        ignores.push( item.glob )
      } else {
        globs.push( item.glob )
      }
    })

    let input

    fetch( globs, ignores )

    .map((file:string) => {
      return this.pipeline.relativeToLoadPath( file )
    })

    .forEach(( input ) => {
      this.manifest.ASSETS[input] = {
        input:  input,
        output: input,
        cache:  input
      }

      this.resolve( input )
    })
  }

  getRules(file:string) {
    let rules = {}

    for (let i = 0, ilen = this._globs.length, item, relativeGlob; i < ilen; i++) {
      item = this._globs[i]
      relativeGlob = this.pipeline.relativeToLoadPath(item.glob)
      if (file === relativeGlob) {
        rules = item
        break;
      } else if (minimatch(file, relativeGlob)) {
        rules = Object.assign(rules, item)
      }
    }

    return rules
  }

  resolve(file:string) {
    let rules = this.getRules( file ) as GlobItem

    this.resolveOutput( file, rules )

    if ("alternatives" in rules && rules.alternatives) {
      const item = this.manifest.ASSETS[file]

      item.alternatives = {
        condition: rules.alternatives.condition,
        outputs: []
      }

      rules.alternatives.outputs.forEach((alt) => {
        rules = Object.assign(rules, alt)
        this.resolveOutput( file, rules, true )
      })
    }
  }

  resolveOutput(file:string, rules:GlobItem, isAlternative?:boolean) {
    let output = file, pathObject

    // Remove path and keep basename only
    if ("keep_path" in rules && !rules.keep_path) {
      output = basename(output)
    }

    // Rename output basename
    if ("rename" in rules && typeof rules.rename === 'string') {
      pathObject      = parse(output)
      pathObject.base = rules.rename
      output          = format(pathObject)
    }

    // Add baseDir
    if ("baseDir" in rules && typeof rules.baseDir === 'string') {
      output = join( this.pipeline.dst_path, rules.baseDir, output )
      output = relative( this.pipeline.dst_path, output )
    }

    // Replace dir path if needed
    pathObject     = parse(output)
    pathObject.dir = this.pipeline.getPath( pathObject.dir )
    output         = format( pathObject )

    let cache = output

    if (
      (this.pipeline.cacheable && !("cache" in rules))
      ||
      this.pipeline.cacheable && rules.cache
    ) {
      cache = hashCache(output, this.pipeline.asset_key)
    }

    if (isAlternative && "alternatives" in this.manifest.ASSETS[file]) {
      const alts = this.manifest.ASSETS[file].alternatives as AlternativeOutputs

      alts.outputs.push({
        data: rules.data,
        output: output,
        cache: cache
      })
    } else {
      this.manifest.ASSETS[file].output = output
      this.manifest.ASSETS[file].cache  = cache
    }
  }

}