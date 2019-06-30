import { Pipeline } from "./pipeline"
import { join, normalize, relative, basename, dirname, parse, format } from "path";
import { hashCache, versionCache, generateHash } from "./cache";
import { template2 } from "lol/utils/string";
import { IFileRule, IAsset, IMatchRule } from "./types";
import { clone } from "lol/utils/object";
import minimatch = require("minimatch");

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

  findRule(path: string) {
    for (let i = 0, ilen = this.rules.length; i < ilen; i++) {
      const rule = this.rules[i]

      if (path === rule.glob || minimatch(path, rule.glob)) {
        return rule
      }
    }

    return { glob: path } as IMatchRule
  }

  resolve(asset: IAsset) {
    // Ignore files registered from directory_pipeline or from previous rules
    if (this.manifest.assets[asset.input] && this.manifest.assets[asset.input].resolved) return;

    const rule = asset.rule || this.findRule(asset.input)
    this.manifest.assets[asset.input] = asset
    this.resolveOutput(asset.input, clone(rule))
  }

  resolveOutput(file: string, rule: IMatchRule) {
    let output = file, pathObject

    // Remove path and keep basename only
    if ("keep_path" in rule && !rule.keep_path) {
      output = basename(output)
    }

    // Add base_dir
    if ("base_dir" in rule && typeof rule.base_dir === 'string') {
      output = join(this.pipeline.dst_path, rule.base_dir, output)
      output = relative(this.pipeline.dst_path, output)
    }

    // Replace dir path if needed
    pathObject = parse(output)
    pathObject.dir = this.resolver.getPath(pathObject.dir)
    output = format(pathObject)

    let cache = output

    if (
      (this.cacheable && !("cache" in rule))
      ||
      this.cacheable && rule.cache
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
    if ("rename" in rule) {
      if (typeof rule.rename === 'function') {
        output = rule.rename(output, file, rule)
        rule.rename = output
      } else if (typeof rule.rename === 'string') {
        pathObject = parse(output)
        output = template2(rule.rename, {
          hash: "",
          ...pathObject
        }, TemplateOptions)
        output = normalize(output)
        cache = template2(rule.rename, {
          hash: this.cacheable && rule.cache ? generateHash(output + this.hash_key) : '',
          ...pathObject
        }, TemplateOptions)
        cache = normalize(cache)
      }
    }

    this.manifest.assets[file].output = output
    this.manifest.assets[file].cache = cache
    this.manifest.assets[file].resolved = true
    this.manifest.assets[file].rule = rule
  }

}