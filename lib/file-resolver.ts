import Path from 'path';
import { AssetItemRules, AssetItem } from './asset-pipeline';
import { fetch, fetchDirs } from './utils/fs';
import { unique } from 'lol/utils/array';

export class Resolver {

  root_path: string = process.cwd()

  private load_paths: string[] = []

  add(path: string) {
    if (!this.has(path)) this.load_paths.push( path )
  }

  has(path: string) {
    return this.load_paths.indexOf(path) > -1
  }

  remove(path: string) {
    const index = this.load_paths.indexOf(path)
    if (index > -1) this.load_paths.splice(index, 1)
  }

  get_paths() {
    return this.load_paths.slice(0)
  }

  absolute_load_path(load_path: string) {
    return Path.join(this.root_path, load_path)
  }

  from_load_path(load_path: string, path: string) {
    return Path.join(this.root_path, load_path, path)
  }

  relative_to_load_path(load_path: string, path: string) {
    return Path.relative(Path.join(this.root_path, load_path), path)
  }

  fetch(rules: AssetItemRules[], type: "file" | "directory" = "file") {
    const fetcher = this._fetcher(type)

    const assets = this.load_paths.map((load_path) => {
      const globs:   string[] = []
      const ignores: string[] = []

      rules.forEach((rule) => {
        if ("ignore" in rule && rule.ignore) {
          ignores.push( this.from_load_path(load_path, rule.glob) )
        } else {
          globs.push( this.from_load_path(load_path, rule.glob) )
        }
      })

      return fetcher( globs, ignores )
      .map((file) => {
        const input = this.relative_to_load_path(load_path, file)

        return {
          load_path,
          input: input,
          output: input,
          cache: input
        }
      })
    })

    return Array.prototype.concat.apply([], assets) as AssetItem[]
  }

  fetchDirs(rules: AssetItemRules[]) {
    return this.fetch(rules, "directory")
  }

  _fetcher(type: "file" | "directory" = "file") {
    return function(globs: string[], ignores: string[]) {
      if (type == "file") {
        return fetch(globs, ignores)
      } else {
        return unique(fetchDirs( globs, ignores ))
      }
    }
  }

  forEach<T>(items: T[], cb: (item: T, load_path: string) => void) {
    items.forEach((item) => {
      this.load_paths.forEach((load_path) => {
        cb(item, load_path)
      })
    })
  }

  map<T, S>(items: T[], cb: (item: T, load_path: string) => S) {
    const new_items: S[] = []

    items.forEach((item) => {
      this.load_paths.forEach((load_path) => {
        new_items.push(cb(item, load_path))
      })
    })

    return new_items
  }

  filter<T>(items: T[], cb: (item: T, load_path: string) => boolean) {
    const new_items: T[] = []

    items.forEach((item) => {
      this.load_paths.forEach((load_path) => {
        if (cb(item, load_path)) {
          new_items.push( item )
        }
      })
    })

    return new_items
  }

  filter_and_map<T, S>(items: T[], cb: (item: T, load_path: string) => S | boolean) {
    const new_items: S[] = []

    items.forEach((item) => {
      this.load_paths.forEach((load_path) => {
        const result = cb(item, load_path)
        if (result) new_items.push(result as S)
      })
    })

    return new_items
  }

}