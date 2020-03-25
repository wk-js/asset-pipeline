import { Pipeline } from "./pipeline"
import { join, relative, basename, parse, format, normalize } from "path";
import { template2 } from "lol/js/string/template";
import { IFileRule, IAsset, IMatchRule, RenameOptions } from "./types";
import { clone, flat } from "lol/js/object";
import minimatch from "minimatch";
import { cleanPath } from "./utils/path";

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
    glob = cleanPath(glob)

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
    glob = cleanPath(glob)

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
  resolve(pipeline: Pipeline, asset: IAsset) {
    // Ignore files registered from directory_pipeline or from previous rules
    const masset = pipeline.manifest.get(asset.input)
    if (masset && masset.resolved) return;

    const rule = asset.rule || this.matchingRule(asset.input)
    asset.rule = rule
    pipeline.manifest.set(asset)
    this.resolveOutput(pipeline, asset.input, clone(rule))
  }

  protected resolveOutput(pipeline: Pipeline, file: string, rule: IMatchRule) {
    let output = file

    // Remove path and keep basename only
    if (typeof rule.keep_path === 'boolean' && !rule.keep_path) {
      output = basename(output)
    }

    // Add base_dir
    if (typeof rule.base_dir === 'string') {
      output = join(pipeline.resolve.output(), rule.base_dir, output)
      output = relative(pipeline.resolve.output(), output)
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
      output = cache = template2(rule.output, flat(options), TemplateOptions)
    }

    if (typeof rule.cache == 'function') {
      rule.cache = cache = rule.cache(options)
    } else if (typeof rule.cache === 'string') {
      cache = template2(rule.cache, flat(options), TemplateOptions)
    } else if (
      (typeof rule.cache == 'boolean' && rule.cache && pipeline.cache.enabled)
      ||
      (typeof rule.cache != 'boolean' && pipeline.cache.enabled)
    ) {
      if (pipeline.cache.type === 'hash') {
        cache = pipeline.cache.hash(output)
      } else if (pipeline.cache.type === 'version' && this.type === 'file') {
        cache = pipeline.cache.version(output)
      }
    }

    const asset = pipeline.manifest.get(file) as IAsset
    asset.input = cleanPath(asset.input)
    asset.output = cleanPath(output)
    asset.cache = cleanPath(cache)
    asset.resolved = true
    asset.tag = typeof rule.tag == 'string' ? rule.tag : 'default'
    asset.rule = rule
    pipeline.manifest.set(asset)
  }

  protected resolveDir(pipeline: Pipeline, output: string) {
    const pathObject = parse(output)
    let dir = pathObject.dir

    let d: string[] = []
    dir = cleanPath(dir)
    const ds = dir.split('/')
    for (let i = 0; i < ds.length; i++) {
      d.push( ds[i] )
      const dd = d.join('/')
      const ddd = pipeline.resolve.path(dd)
      if (dd != ddd) {
        d = ddd.split('/')
      }
    }
    pathObject.dir = normalize(d.join('/'))
    return format(pathObject)
  }

}