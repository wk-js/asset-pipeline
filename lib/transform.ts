import { Pipeline } from "./pipeline"
import { join, relative, basename, parse, format } from "path";
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

  constructor(public type = "file") {}

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
      file.rules.push( glob )
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

    return { glob: path + '/**/*' } as IMatchRule
  }

  /**
   * Apply the transformation to the asset and register to the manifest
   */
  resolve(pipeline: Pipeline, asset: IAsset) {
    // Ignore files registered from directory_pipeline or from previous rules
    const masset = pipeline.manifest.get(asset.input)
    if (masset && masset.resolved) return;

    const rule = asset.rule || this.matchingRule(asset.input)
    pipeline.manifest.set(asset)
    this.resolveOutput(pipeline, asset.input, clone(rule))
  }

  protected resolveOutput(pipeline: Pipeline,file: string, rule: IMatchRule) {
    let output = file, pathObject

    // Remove path and keep basename only
    if ("keep_path" in rule && !rule.keep_path) {
      output = basename(output)
    }

    // Add base_dir
    if ("base_dir" in rule && typeof rule.base_dir === 'string') {
      output = join(pipeline.resolve.output(), rule.base_dir, output)
      output = relative(pipeline.resolve.output(), output)
    }

    // Replace dir path if needed
    pathObject = parse(output)
    pathObject.dir = pipeline.resolve.path(pathObject.dir)
    output = format(pathObject)

    let cache = output

    if (
      (pipeline.cache.enabled && !("cache" in rule))
      ||
      pipeline.cache.enabled && rule.cache
    ) {
      if (pipeline.cache.type === 'hash') {
        cache = pipeline.cache.hash(output)
      } else if (pipeline.cache.type === 'version' && this.type === 'file') {
        cache = pipeline.cache.version(output)
      } else {
        cache = output
      }
    }

    // Rename output
    if ("rename" in rule) {
      const hash = pipeline.cache.generateHash(output + pipeline.cache.key)
      const options: RenameOptions = {
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

      if (typeof rule.rename == 'function') {
        rule.rename = output = cache = rule.rename(options)
      } else if (typeof rule.rename === 'string') {
        output = cache = template2(rule.rename, flat(options), TemplateOptions)
      }
    }

    const asset = pipeline.manifest.get(file) as IAsset
    asset.input = cleanPath(asset.input)
    asset.output = cleanPath(output)
    asset.cache = cleanPath(cache)
    asset.resolved = true
    asset.rule = rule
    asset.tag = typeof rule.tag == 'string' ? rule.tag : 'default'
    pipeline.manifest.set(asset)
  }

}