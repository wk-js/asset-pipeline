import { Pipeline } from "./pipeline"
import { join, relative, basename, parse, format } from "path";
import { template2 } from "lol/utils/string";
import { IFileRule, IAsset, IMatchRule } from "./types";
import { clone } from "lol/utils/object";
import minimatch from "minimatch";
import { cleanPath } from "./utils/path";
import { unique } from "lol/utils/array";
import { fetch, fetchDirs } from "./utils/fs";

const TemplateOptions = {
  open: '#{',
  body: '[a-z@$#-_?!]+',
  close: '}'
}

export class FilePipeline {

  rules: IMatchRule[] = []
  type: "file" | "directory" = 'file'

  constructor(public pipeline: Pipeline) { }

  add(glob: string, parameters: IFileRule = {}) {
    glob = cleanPath(glob)

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
    glob = cleanPath(glob)

    const parameters = {
      glob: glob,
      ignore: true
    }

    this.rules.push(parameters)
  }

  fetch() {
    this._fetch().forEach(this.resolve.bind(this))
  }

  protected _fetch() {
    const fetcher = this._fetcher(this.type)

    const globs: string[] = []
    const ignores: string[] = []

    for (let i = 0; i < this.rules.length; i++) {
      const rule = this.rules[i];

      this.pipeline.source.all(true).forEach((source) => {
        if ("ignore" in rule && rule.ignore) {
          ignores.push(this.pipeline.source.source_with(source, rule.glob, true))
        } else {
          globs.push(this.pipeline.source.source_with(source, rule.glob, true))
        }
      })
    }

    const assets = fetcher(globs, ignores)
      .map((file) => {
        const source = this.pipeline.source.find_from(file, true) as string
        const input = this.pipeline.resolve.relative(source, file)

        return {
          load_path: this.pipeline.resolve.relative(this.pipeline.resolve.root(), source),
          input: input,
          output: input,
          cache: input,
          resolved: false
        } as IAsset
      })

    return assets
  }

  private _fetcher(type: "file" | "directory" = "file") {
    return function (globs: string[], ignores: string[]) {
      try {
        if (type == "file") {
          return fetch(globs, ignores)
        } else {
          return unique(fetchDirs(globs, ignores))
        }
      } catch (e) { }
      return []
    }
  }

  protected findRule(path: string) {
    for (let i = 0, ilen = this.rules.length; i < ilen; i++) {
      const rule = this.rules[i]

      if (path === rule.glob || minimatch(path, rule.glob)) {
        return rule
      }
    }

    return { glob: path + '/**/*' } as IMatchRule
  }

  protected resolve(asset: IAsset) {
    // Ignore files registered from directory_pipeline or from previous rules
    const masset = this.pipeline.manifest.get(asset.input)
    if (masset && masset.resolved) return;

    const rule = asset.rule || this.findRule(asset.input)
    this.pipeline.manifest.set(asset)
    this.resolveOutput(asset.input, clone(rule))
  }

  protected resolveOutput(file: string, rule: IMatchRule) {
    let output = file, pathObject

    // Remove path and keep basename only
    if ("keep_path" in rule && !rule.keep_path) {
      output = basename(output)
    }

    // Add base_dir
    if ("base_dir" in rule && typeof rule.base_dir === 'string') {
      output = join(this.pipeline.resolve.output(), rule.base_dir, output)
      output = relative(this.pipeline.resolve.output(), output)
    }

    // Replace dir path if needed
    pathObject = parse(output)
    pathObject.dir = this.pipeline.resolve.path(pathObject.dir)
    output = format(pathObject)

    let cache = output

    if (
      (this.pipeline.cache.enabled && !("cache" in rule))
      ||
      this.pipeline.cache.enabled && rule.cache
    ) {
      if (this.pipeline.cache.type === 'hash') {
        cache = this.pipeline.cache.hash(output)
      } else if (this.pipeline.cache.type === 'version' && this.type === 'file') {
        cache = this.pipeline.cache.version(output)
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
        cache = template2(rule.rename, {
          hash: this.pipeline.cache.enabled && rule.cache ? this.pipeline.cache.generateHash(output + this.pipeline.cache.key) : '',
          ...pathObject
        }, TemplateOptions)
      }
    }

    const asset = this.pipeline.manifest.get(file) as IAsset
    asset.input = cleanPath(asset.input)
    asset.output = cleanPath(output)
    asset.cache = cleanPath(cache)
    asset.resolved = true
    asset.rule = rule
    this.pipeline.manifest.set(asset)
  }

}