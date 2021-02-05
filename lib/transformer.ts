import { PathBuilder, PathOrString, toWebString } from "./path/path";
import { TransformRule } from "./transform-rule"
import { RuleOptions, TransformResult } from "./types"

const PATH = new PathBuilder("")

export class Transformer {

  saltKey = ""
  cachebreak = false
  entries: TransformRule[] = []
  results: TransformResult[] = []

  add(pattern: PathOrString) {
    const t = new TransformRule(toWebString(pattern))
    this.entries.push(t)
    return t
  }

  delete(pattern: PathOrString) {
    const path = toWebString(pattern)
    const index = this.entries.findIndex(item => item.pattern === path)
    if (index > -1) this.entries.splice(index, 1)
  }

  transform(files: string[]) {
    const options: RuleOptions = {
      saltKey: this.saltKey,
      cachebreak: this.cachebreak
    }
    const results: TransformResult[] = []

    for (const filename of files) {
      const transforms = this.entries
        .filter(t => t.match(filename))
        .sort((a, b) => a.priority < b.priority ? -1 : 1)

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