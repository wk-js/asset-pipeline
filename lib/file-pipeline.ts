import { AssetPipeline, AssetItemRules, Rules } from "./asset-pipeline";
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

  add(glob:string, parameters:Rules = {}) {
    glob = normalize(glob)

    const params: AssetItemRules = parameters = Object.assign({
      glob: glob
    }, parameters)
    params.glob = glob

    this.rules.push( params )
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
    this.pipeline.load_paths
    .fetch(this.rules)
    .forEach((asset) => {
      this.manifest.assets[asset.input] = asset
      this.resolve( asset.input )
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

    return rules as AssetItemRules
  }

  resolve(file:string) {
    let rules = this.getRules( file ) as AssetItemRules

    this.resolveOutput( file, rules )
  }

  resolveOutput(file:string, rules:AssetItemRules) {
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
      output = rules.resolve(output, file, rules)
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