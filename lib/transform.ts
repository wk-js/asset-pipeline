import { Pipeline } from "./pipeline"
import { basename, parse, format, ParsedPath } from "path";
import { template2 } from "lol/js/string/template";
import { IAsset, IMatchRule, RenameOptions, IMinimumRule } from "./types";
import { clone, flat } from "lol/js/object";
import minimatch from "minimatch";
import { normalize } from "./path";

const TemplateOptions = {
  open: '#{',
  body: '[a-z@$#-_?!]+',
  close: '}'
}

/**
 * Look for the first matching rule. If not found, a generic rule is returned.
 */
function matchRule(path: string, rules: IMatchRule[]) {
  for (let i = 0, ilen = rules.length; i < ilen; i++) {
    const rule = rules[i]

    if (path === rule.glob || minimatch(path, rule.glob)) {
      return rule
    }
  }

  return { glob: path } as IMatchRule
}

function resolveDir(pipeline: Pipeline, output: string) {
  const pathObject = parse(output)
  let dir = pathObject.dir

  let d: string[] = []
  dir = normalize(dir, "unix")
  const ds = dir.split('/').filter(part => !!part)

  for (let i = 0; i < ds.length; i++) {
    d.push(ds[i])
    const dd = d.join('/')

    const asset = pipeline.manifest.getAsset(dd)
    if (!asset) continue
    const ddd = pipeline.cache.enabled ? asset.cache : asset.output
    if (dd != ddd) {
      d = ddd.split('/')
    }
  }

  pathObject.dir = d.join('/')
  return format(pathObject)
}

function _tranformOutput(pipeline: Pipeline, asset: IAsset, rule: IMatchRule) {
  let output = asset.input

  // Replace dir path if needed
  output = resolveDir(pipeline, output)

  // Remove path and keep basename only
  if (typeof rule.keepPath === 'boolean' && !rule.keepPath) {
    output = asset.type === "file" ? basename(output) : "."
  }

  // Add base_dir
  if (typeof rule.baseDir === 'string') {
    const base_dir = pipeline.output.join(rule.baseDir, output)
    output = pipeline.output.relative(base_dir.os()).os()
  }

  const hash = pipeline.cache.generateHash(output + pipeline.cache.key)

  let options: RenameOptions = {
    rule,
    input: {
      hash,
      fullpath: asset.input,
      ...parse(asset.input)
    },
    output: {
      hash,
      fullpath: output,
      ...parse(output)
    }
  }

  rule.output = output = _rename(output, rule.output, options)

  options.output = {
    hash,
    fullpath: output,
    ...parse(output)
  }

  let cache = output

  if (typeof rule.cache === "function" || typeof rule.cache === "string" || typeof rule.cache === "object") {
    rule.cache = cache = _rename(output, rule.cache, options)
  } else if (
    pipeline.cache.enabled &&
    ((typeof rule.cache === "boolean" && rule.cache) || typeof rule.cache != 'boolean')
  ) {
    if (pipeline.cache.type === 'hash') {
      rule.cache = cache = pipeline.cache.hash(output)
      rule.cache = normalize(cache, "web")
    } else if (pipeline.cache.type === 'version' && asset.type === 'file') {
      rule.cache = cache = pipeline.cache.version(output)
      rule.cache = normalize(cache, "web")
    }
  }

  asset.input = normalize(asset.input, "web")
  asset.output = normalize(output, "web")
  asset.cache = normalize(cache, "web")
  asset.resolved = true
  asset.tag = typeof rule.tag == 'string' ? rule.tag : 'default'
  asset.rule = rule
  return asset
}

function _rename(output: string, rename: IMinimumRule['output'], options: RenameOptions) {
  switch (typeof rename) {
    case "function": {
      output = rename(options)
      break
    }

    case "string": {
      output = template2(rename, flat(options), TemplateOptions)
      break
    }

    case "object": {
      const parsed: ParsedPath = Object.assign(parse(options.output.fullpath), rename)
      if ("ext" in rename || "name" in rename) {
        parsed.base = `${parsed.name}${parsed.ext}`
      }
      for (const key of Object.keys(parsed) as (keyof ParsedPath)[]) {
        parsed[key] = template2(parsed[key], flat(options), TemplateOptions)
      }
      output = format(parsed)
      break
    }
  }

  return normalize(output, "web")
}


/**
 * Apply output/cache transformation to the asset input
 */
export function transform(pipeline: Pipeline, asset: IAsset, rules: IMatchRule[]) {
  // Ignore files registered from directory_pipeline or from previous rules
  const masset = pipeline.manifest.getAsset(asset.input)
  if (masset && masset.resolved) return asset

  const rule = asset.rule || matchRule(asset.input, rules)
  asset.rule = rule
  return _tranformOutput(pipeline, asset, clone(rule))
}