import { AssetPipeline, AssetItemRules, AlternativeOutputs } from "./asset-pipeline";
import { fetch } from './utils/fs';
import { join, normalize, relative, basename, dirname, parse, format } from "path";
import minimatch from 'minimatch';
import { hashCache, versionCache } from "./cache";
import { template2 } from "lol/utils/string";

export class FilePipeline {

  rules: AssetItemRules[] = []
  type: string = 'file'

  constructor(public pipeline:AssetPipeline) {}

  get manifest() {
    return this.pipeline.manifest.manifest
  }

  add(glob:string, parameters?:AssetItemRules) {
    glob = normalize(glob)

    parameters = Object.assign({
      glob: glob
    }, parameters || {})
    parameters.glob = glob

    this.rules.push( parameters )
  }

  ignore(glob:string) {
    glob = normalize(glob)

    const parameters = {
      glob: glob,
      ignore: true
    }

    this.rules.push( parameters )
  }

  fetch() {
    const globs:   string[] = []
    const ignores: string[] = []

    this.rules.forEach((item) => {
      if ("ignore" in item && item.ignore) {
        ignores.push( this.pipeline.fromLoadPath(item.glob) )
      } else {
        globs.push( this.pipeline.fromLoadPath(item.glob) )
      }
    })

    let input

    fetch( globs, ignores )

    .map((file:string) => {
      return this.pipeline.relativeToLoadPath( file )
    })

    .forEach(( input:string ) => {
      this.manifest.assets[input] = {
        input:  input,
        output: input,
        cache:  input
      }

      this.resolve( input )
    })
  }

  getRules(file:string) {
    let rules = {}

    for (let i = 0, ilen = this.rules.length, item, relativeGlob; i < ilen; i++) {
      item = this.rules[i]

      // if (file === item.glob) {
      //   rules = item
      //   break;
      // } else if (minimatch(file, item.glob)) {
      //   rules = Object.assign(rules, item)
      // }

      if (file === item.glob || minimatch(file, item.glob)) {
        rules = Object.assign(rules, item)
      }
    }

    return rules
  }

  resolve(file:string) {
    let rules = this.getRules( file ) as AssetItemRules

    this.resolveOutput( file, rules )

    if ("alternatives" in rules && rules.alternatives) {
      const item = this.manifest.assets[file]

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

  resolveOutput(file:string, rules:AssetItemRules, isAlternative:boolean = false) {
    let output = file, pathObject

    // Remove path and keep basename only
    if ("keep_path" in rules && !rules.keep_path) {
      output = basename(output)
    }

    // Rename output basename
    if ("rename" in rules && typeof rules.rename === 'string') {
      pathObject = parse(output)
      output = join( dirname( output ), rules.rename )
      output = template2( output, pathObject )
    }

    // Add base_dir
    if ("base_dir" in rules && typeof rules.base_dir === 'string') {
      output = join( this.pipeline.dst_path, rules.base_dir, output )
      output = relative( this.pipeline.dst_path, output )
    }

    // Replace dir path if needed
    pathObject     = parse(output)
    pathObject.dir = this.pipeline.getPath( pathObject.dir )
    output         = format( pathObject )

    if ("resolve" in rules && typeof rules.resolve === 'function') {
      output = rules.resolve(output, file, rules, isAlternative)
    }

    let cache = output

    if (
      (this.pipeline.cacheable && !("cache" in rules))
      ||
      this.pipeline.cacheable && rules.cache
    ) {
      if (this.pipeline.cache_type === 'hash') {
        cache = hashCache(output, this.pipeline.asset_key)
      } else if (this.pipeline.cache_type === 'version' && this.type === 'file') {
        cache = versionCache(output, this.pipeline.asset_key)
      } else {
        cache = output
      }
    }

    this.manifest.assets[file].output = output
    this.manifest.assets[file].cache  = cache
  }

}