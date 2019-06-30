import Path from 'path';
import { Pipeline } from './pipeline'
import { fetch, fetchDirs } from './utils/fs';
import { unique } from 'lol/utils/array';
import { IMatchRule, IAsset } from './types';

export class FileMatcher {

  private load_paths: string[] = []

  constructor(private pipeline: Pipeline) { }

  get root_path() {
    return this.pipeline.root_path
  }

  add(path: string) {
    if (!this.has(path)) this.load_paths.push(path)
  }

  has(path: string) {
    return this.load_paths.indexOf(path) > -1
  }

  remove(path: string) {
    const index = this.load_paths.indexOf(path)
    if (index > -1) this.load_paths.splice(index, 1)
  }

  getPaths() {
    return this.load_paths.slice(0)
  }

  getAbsoluteLoadPath(load_path: string) {
    return Path.join(this.root_path, load_path)
  }

  fromLoadPath(load_path: string, path: string) {
    return Path.join(this.root_path, load_path, path)
  }

  relativeToLoadPath(load_path: string, path: string) {
    return Path.relative(Path.join(this.root_path, load_path), path)
  }

  findLoadPath(path: string) {
    path = Path.normalize(path)

    for (let i = 0; i < this.load_paths.length; i++) {
      const load_path = Path.isAbsolute(path) ? this.getAbsoluteLoadPath(this.load_paths[i]) : this.load_paths[i];
      if (path.indexOf(load_path) > -1) return this.load_paths[i]
    }

    return null
  }

  fetch(rules: IMatchRule[], type: "file" | "directory" = "file") {
    const fetcher = this._fetcher(type)

    const globs: string[] = []
    const ignores: string[] = []

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];

      this.load_paths.forEach((load_path) => {
        if ("ignore" in rule && rule.ignore) {
          ignores.push(this.fromLoadPath(load_path, rule.glob))
        } else {
          globs.push(this.fromLoadPath(load_path, rule.glob))
        }
      })
    }

    const assets = fetcher(globs, ignores)
    .map((file) => {
      const load_path = this.findLoadPath(file) as string
      const input = this.relativeToLoadPath(load_path, file)

      return {
        load_path,
        input: input,
        output: input,
        cache: input,
        resolved: false
      } as IAsset
    })

    return assets
  }

  fetchDirs(rules: IMatchRule[]) {
    return this.fetch(rules, "directory")
  }

  _fetcher(type: "file" | "directory" = "file") {
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
          new_items.push(item)
        }
      })
    })

    return new_items
  }

  filterAndMap<T, S>(items: T[], cb: (item: T, load_path: string) => S | boolean) {
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