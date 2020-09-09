import { Pipeline } from "./pipeline"
import { basename, parse, format, ParsedPath } from "path";
import { template2 } from "lol/js/string/template";
import { IFileRule, IAsset, IMatchRule, RenameOptions } from "./types";
import { clone, flat } from "lol/js/object";
import minimatch from "minimatch";
import { normalize } from "./path";

const TemplateOptions = {
  open: '#{',
  body: '[a-z@$#-_?!]+',
  close: '}'
}

export class Transform {

  protected rules: IMatchRule[] = []

  constructor(public type = "file") { }

  /**
   * Add as transformation applied to the glob pattern
   */
  add(glob: string, parameters: IFileRule = {}) {
    glob = normalize(glob, "web")

    const params: IMatchRule = parameters = Object.assign({
      glob: glob
    }, parameters)
    params.glob = glob

    this.rules.push(params)
  }

  /**
   * Shortcut for input/output transformation
   */
  addEntry(input: string, output: string, parameters: IFileRule = {}) {
    parameters = Object.assign({
      rename: output,
      keep_path: false
    }, parameters)
    this.add(input, parameters)
  }

  /**
   * Add as transformation applied to the glob pattern
   */
  ignore(glob: string) {
    glob = normalize(glob, "web")

    const parameters = {
      glob: glob,
      ignore: true
    }

    this.rules.push(parameters)
  }

  /**
   * Clone the rules
   */
  clone(file: Transform) {
    for (let i = 0; i < this.rules.length; i++) {
      const glob = this.rules[i];
      file.rules.push(glob)
    }
    return file
  }

  /**
   * Look for the first matching rule. If not found, a generic rule is returned.
   */
  matchingRule(path: string) {
    for (let i = 0, ilen = this.rules.length; i < ilen; i++) {
      const rule = this.rules[i]

      if (path === rule.glob || minimatch(path, rule.glob)) {
        return rule
      }
    }

    return { glob: path } as IMatchRule
  }

  /**
   * Apply the transformation to the asset and register to the manifest
   */
  transform(pipeline: Pipeline, asset: IAsset) {
    // Ignore files registered from directory_pipeline or from previous rules
    const masset = pipeline.manifest.get(asset.input)
    if (masset && masset.resolved) return;

    const rule = asset.rule || this.matchingRule(asset.input)
    asset.rule = rule
    pipeline.manifest.add(asset)
    this.tranformOutput(pipeline, asset.input, clone(rule))
  }

  protected tranformOutput(pipeline: Pipeline, file: string, rule: IMatchRule) {
    let output = file

    // Remove path and keep basename only
    if (typeof rule.keep_path === 'boolean' && !rule.keep_path) {
      output = basename(output)
    }

    // Add base_dir
    if (typeof rule.base_dir === 'string') {
      const base_dir = pipeline.output.join(rule.base_dir, output)
      output = pipeline.output.relative(base_dir.os()).os()
    }

    // Replace dir path if needed
    output = this.resolveDir(pipeline, output)

    let cache = output

    const hash = pipeline.cache.generateHash(output + pipeline.cache.key)
    let options: RenameOptions = {
      rule,
      input: {
        hash,
        fullpath: file,
        ...parse(file)
      },
      output: {
        hash,
        fullpath: output,
        ...parse(output)
      }
    }

    if (typeof rule.output == 'function') {
      rule.output = output = cache = rule.output(options)
    } else if (typeof rule.output === 'string') {
      rule.output = output = cache = template2(rule.output, flat(options), TemplateOptions)
    } else if (typeof rule.output === 'object') {
      const parsed: ParsedPath = Object.assign(parse(options.output.fullpath), rule.output)
      if ("ext" in rule.output || "name" in rule.output) {
        parsed.base = `${parsed.name}${parsed.ext}`
      }
      for (const key of Object.keys(parsed) as (keyof ParsedPath)[]) {
        parsed[key] = template2(parsed[key], flat(options), TemplateOptions)
      }
      rule.output = output = cache = format(parsed)
    }

    if (typeof rule.cache == 'function') {
      rule.cache = cache = rule.cache(options)
    } else if (typeof rule.cache === 'string') {
      rule.cache = cache = template2(rule.cache, flat(options), TemplateOptions)
    } else if (typeof rule.cache === 'object') {
      const parsed: ParsedPath = Object.assign(parse(cache), rule.cache)
      if ("ext" in rule.cache || "name" in rule.cache) {
        parsed.base = `${parsed.name}${parsed.ext}`
      }
      for (const key of Object.keys(parsed) as (keyof ParsedPath)[]) {
        parsed[key] = template2(parsed[key], flat(options), TemplateOptions)
      }
      rule.cache = cache = format(parsed)
    } else if (
      (typeof rule.cache == 'boolean' && rule.cache && pipeline.cache.enabled)
      ||
      (typeof rule.cache != 'boolean' && pipeline.cache.enabled)
    ) {
      if (pipeline.cache.type === 'hash') {
        rule.cache = cache = pipeline.cache.hash(output)
      } else if (pipeline.cache.type === 'version' && this.type === 'file') {
        rule.cache = cache = pipeline.cache.version(output)
      }
    }

    const asset = pipeline.manifest.get(file) as IAsset
    asset.input = normalize(asset.input, "web")
    asset.output = normalize(output, "web")
    asset.cache = normalize(cache, "web")
    asset.resolved = true
    asset.tag = typeof rule.tag == 'string' ? rule.tag : 'default'
    asset.rule = rule
    pipeline.manifest.add(asset)
  }

  protected resolveDir(pipeline: Pipeline, output: string) {
    const pathObject = parse(output)
    let dir = pathObject.dir

    let d: string[] = []
    dir = normalize(dir, "web")
    const ds = dir.split('/').filter(part => !!part)
    for (let i = 0; i < ds.length; i++) {
      d.push( ds[i] )
      const dd = d.join('/')
      const ddd = pipeline.getPath(dd)
      if (dd != ddd) {
        d = ddd.split('/')
      }
    }

    pathObject.dir = d.join('/')
    return format(pathObject)
  }

}