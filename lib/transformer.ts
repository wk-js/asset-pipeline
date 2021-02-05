import { PathOrString, toWebString } from "./path/path";
import { TransformRule, CreateTransformRule } from "./transform-rule"
import { RuleOptions, TransformResult } from "./types"

export class Transformer {

  saltKey = ""
  cachebreak = false
  rules: TransformRule[] = []
  results: TransformResult[] = []

  add(pattern: PathOrString) {
    const t = CreateTransformRule(toWebString(pattern))
    this.rules.push(t)
    return t
  }

  delete(pattern: PathOrString) {
    const path = toWebString(pattern)
    const index = this.rules.findIndex(item => item.pattern === path)
    if (index > -1) this.rules.splice(index, 1)
  }

  transform(files: string[]) {
    const options: RuleOptions = {
      saltKey: this.saltKey,
      cachebreak: this.cachebreak
    }
    const results: TransformResult[] = []

    for (const filename of files) {
      const transforms = this.rules.filter(t => t.match(filename))

      if (transforms.length > 0) {
        for (const transform of transforms) {
          const result = transform.apply(filename, options)
          results.push([filename, result])
        }
      } else {
        results.push([filename, { path: filename, tag: "default", priority: 0 }])
      }
    }

    return this.results = results
  }

}