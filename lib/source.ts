import { cleanPath } from "./utils/path";
import Path from "path";
import { Pipeline } from "./pipeline";

export class Source {

  private _sources: string[] = []

  constructor(private pipeline: Pipeline) {}

  clone(source: Source) {
    for (let i = 0; i < this._sources.length; i++) {
      const s = this._sources[i];
      source.add(s)
    }
  }

  add(path: string) {
    path = cleanPath(path)
    if (this._sources.indexOf(path) == -1) this._sources.push(path)
  }

  has(path: string) {
    path = cleanPath(path)
    return this._sources.indexOf(path) > -1
  }

  remove(path: string) {
    path = cleanPath(path)
    const index = this._sources.indexOf(path)
    if (index > -1) this._sources.splice(index, 1)
  }

  with(source: string, input: string, absolute: boolean = false) {
    input = cleanPath(input)
    const root = this.pipeline.resolve.root()

    if (absolute && !Path.isAbsolute(source)) {
      source = Path.join(root, source)
    } else if (!absolute && Path.isAbsolute(source)) {
      source = Path.relative(root, source)
    }

    input = Path.join(source, input)
    return cleanPath(input)
  }

  all(is_absolute: boolean = false) {
    if (!is_absolute) return this._sources.slice(0)

    return this._sources.map((source) => {
      return cleanPath(Path.join(this.pipeline.resolve.root(), source))
    })
  }

  find_from_input(input: string, is_absolute: boolean = false) {
    if (Path.isAbsolute(input)) input = this.pipeline.resolve.relative(this.pipeline.resolve.root(), input)
    input = cleanPath(input)

    for (let i = 0; i < this._sources.length; i++) {
      let source = this._sources[i]

      if (input.indexOf(source) > -1) {
        if (is_absolute) {
          source = Path.join(this.pipeline.resolve.root(), source)
        }

        return cleanPath(source)
      }
    }

    return null
  }

  forEach<T>(items: T[], cb: (item: T, source: string) => void) {
    this._sources.forEach((source) => {
      items.forEach((item) => {
        cb(item, source)
      })
    })
  }

  map<T, S>(items: T[], cb: (item: T, source: string) => S) {
    const new_items: S[] = []

    this._sources.forEach((source) => {
      items.forEach((item) => {
        new_items.push(cb(item, source))
      })
    })

    return new_items
  }

  filter<T>(items: T[], cb: (item: T, source: string) => boolean) {
    const new_items: T[] = []

    this._sources.forEach((source) => {
      items.forEach((item) => {
        if (cb(item, source)) {
          new_items.push(item)
        }
      })
    })

    return new_items
  }

  filter_and_map<T, S>(items: T[], cb: (item: T, source: string) => S | boolean) {
    const new_items: S[] = []

    this._sources.forEach((source) => {
      items.forEach((item) => {
        const result = cb(item, source)
        if (result) new_items.push(result as S)
      })
    })

    return new_items
  }

}