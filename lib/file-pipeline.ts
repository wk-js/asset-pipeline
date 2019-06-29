import { Pipeline } from "./pipeline"
import { join, normalize, relative, basename, dirname, parse, format } from "path";
import { hashCache, versionCache, generateHash } from "./cache";
import { template2 } from "lol/utils/string";
import { IFileRule, IAsset, IMatchRule } from "./types";
import { clone } from "lol/utils/object";

const TemplateOptions = {
  open: '#{',
  body: '[a-z@$#-_?!]+',
  close: '}'
}

export class FilePipeline {

  rules: IMatchRule[] = []
  type: string = 'file'

  constructor(public pipeline: Pipeline) { }

  get manifest() {
    return this.pipeline.manifest.manifest
  }

  get cacheable() {
    return this.pipeline.cacheable
  }

  get cache_type() {
    return this.pipeline.cache_type
  }

  get hash_key() {
    return this.pipeline.hash_key
  }

  get load_paths() {
    return this.pipeline.load_paths
  }

  get resolver() {
    return this.pipeline.resolver
  }

  add(glob: string, parameters: IFileRule = {}) {
    glob = normalize(glob)

    const params: IMatchRule = parameters = Object.assign({
      glob: glob
    }, parameters)
    params.glob = glob

    this.rules.push(params)
  }

  addEntry(input: string, output: string, parameters: IFileRule = {}) {
    parameters = Object.assign({
      rename: output,
      keep_path: false
    }, parameters)
    this.add(input, parameters)
  }

  ignore(glob: string) {
    glob = normalize(glob)

    const parameters = {
      glob: glob,
      ignore: true
    }

    this.rules.push(parameters)
  }

  fetch() {
    this.load_paths
      .fetch(this.rules)
      .forEach(this.resolve.bind(this))
  }

  resolve(asset: IAsset) {
    // Ignore files registered from directory_pipeline or from previous rules
    if (this.manifest.assets[asset.input] && this.manifest.assets[asset.input].resolved) return;

    this.manifest.assets[asset.input] = asset
    this.resolveOutput(asset.input, clone(asset.rule) as IMatchRule)
  }

  resolveOutput(file: string, rules: IMatchRule) {
    let output = file, pathObject

    // Remove path and keep basename only
    if ("keep_path" in rules && !rules.keep_path) {
      output = basename(output)
    }

    // Add base_dir
    if ("base_dir" in rules && typeof rules.base_dir === 'string') {
      output = join(this.pipeline.dst_path, rules.base_dir, output)
      output = relative(this.pipeline.dst_path, output)
    }

    // Replace dir path if needed
    pathObject = parse(output)
    pathObject.dir = this.resolver.getPath(pathObject.dir)
    output = format(pathObject)

    let cache = output

    if (
      (this.cacheable && !("cache" in rules))
      ||
      this.cacheable && rules.cache
    ) {
      if (this.cache_type === 'hash') {
        cache = hashCache(output, this.hash_key)
      } else if (this.cache_type === 'version' && this.type === 'file') {
        cache = versionCache(output, this.hash_key)
      } else {
        cache = output
      }
    }

    // Rename output
    if ("rename" in rules) {
      if (typeof rules.rename === 'function') {
        output = rules.rename(output, file, rules)
        rules.rename = output
      } else if (typeof rules.rename === 'string') {
        pathObject = parse(output)
        output = template2(rules.rename, {
          hash: "",
          ...pathObject
        }, TemplateOptions)
        output = normalize(output)
        cache = template2(rules.rename, {
          hash: this.cacheable && rules.cache ? generateHash(output + this.hash_key) : '',
          ...pathObject
        }, TemplateOptions)
        cache = normalize(cache)
      }
    }

    this.manifest.assets[file].output = output
    this.manifest.assets[file].cache = cache
    this.manifest.assets[file].resolved = true
  }

}