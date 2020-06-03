import { cleanPath } from "./utils/path";
import Path from "path";
import { Pipeline } from "./pipeline";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { Resolver } from "./resolver";
import { FileSystem } from "./file-system";

export class SourceMap {

  private _paths = new Map<string, Source>()

  clone(source: SourceMap) {
    for (const [s, p] of this._paths) {
      const _source = source.add(s)
      _source.file.clone(p.file)
      _source.directory.clone(p.directory)
    }
  }

  add(path: string) {
    path = cleanPath(path)

    if (!this._paths.has(path)) {
      const source = new Source()
      source.path = path
      source.file = new FilePipeline(path)
      source.directory = new DirectoryPipeline(path)
      source.fs = new FileSystem(path)
      this._paths.set(path, source)
    }

    return this._paths.get(path) as Source
  }

  get(path: string) {
    return this._paths.get(path)
  }

  has(path: string) {
    path = cleanPath(path)
    return this._paths.has(path)
  }

  remove(path: string) {
    if (this._paths.has(path)) {
      const item = this._paths.get(path)
      path = cleanPath(path)
      this._paths.delete(path)
      return item
    }
  }

  paths(resolver: Resolver, is_absolute: boolean = false) {
    const sources = [...this._paths.keys()]
    if (!is_absolute) return sources.slice(0)

    return sources.map((path) => {
      return cleanPath(Path.join(resolver.root(), path))
    })
  }

  fetch(pipeline: Pipeline, type = "file" as "file" | "directory") {
    for (const source of this._paths.values()) {
      source[type].fetch(pipeline)
    }
  }

  async copy(pipeline: Pipeline, force = false) {
    for (const source of this._paths.values()) {
      await source.fs.apply(pipeline, force)
    }
  }

}

export class Source {

  path!: string
  file!: FilePipeline
  directory!: DirectoryPipeline
  fs!: FileSystem

  join(resolver: Resolver, input: string, absolute: boolean = false) {
    let path = this.path

    input = cleanPath(input)
    const root = resolver.root()

    if (absolute && !Path.isAbsolute(path)) {
      path = Path.join(root, path)
    } else if (!absolute && Path.isAbsolute(path)) {
      path = Path.relative(root, path)
    }

    input = Path.join(path, input)
    return cleanPath(input)
  }

}