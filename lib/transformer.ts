import { PathBuilder } from "./path"
import { RuleBuilder } from "./rule"
import { RuleOptions, TransformedEntry } from "./types"

const PATH = new PathBuilder("")

export class Transformer {

  saltKey = ""
  cachebreak = false
  entries: RuleBuilder[] = []
  results: TransformedEntry[] = []

  add(pattern: string | PathBuilder) {
    const path = this._toWebPath(pattern)
    const t = new RuleBuilder(path)
    this.entries.push(t)
    return t
  }

  delete(pattern: string | PathBuilder) {
    const path = this._toWebPath(pattern)
    const index = this.entries.findIndex(item => item.pattern === path)
    if (index > -1) this.entries.splice(index, 1)
  }

  transform(files: string[]) {
    const options: RuleOptions = {
      saltKey: this.saltKey,
      cachebreak: this.cachebreak
    }
    const results: TransformedEntry[] = []

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

  protected _toWebPath(pattern: string | PathBuilder): string {
    if (pattern instanceof PathBuilder) {
      return pattern.web()
    } else {
      return PATH.set(pattern).web()
    }
  }

}