import * as Path from "path";
import { PipelineManager } from "./pipeline";
import { FilePipeline } from "./file-pipeline";
import { DirectoryPipeline } from "./directory-pipeline";
import { FileSystem } from "./file-system";
import { PathBuilder, normalize } from "./path";
import { guid } from "lol/js/string/guid";

export class SourceManager {

  private _sources = new Map<string, Source>()

  constructor(private pid: string) { }

  /**
   * Clone SourceMananger
   */
  clone(source: SourceManager) {
    for (const [s, p] of this._sources) {
      const _source = source.add(s)
      _source.file.clone(p.file)
      _source.directory.clone(p.directory)
      _source.fs.clone(p.fs)
    }
  }

  /**
   * Add a new source path, relative to cwd
   */
  add(path: string) {
    path = normalize(path, "os")
    if (Path.isAbsolute(path)) throw new Error("Cannot an absolute path to source")
    const source = new Source(path, this.pid)
    this._sources.set(source.uuid, source)
    return source
  }

  /**
   * Get the source object from source uuid
   */
  get(uuid: string) {
    return this._sources.get(uuid)
  }

  /**
   * Check source exists
   */
  has(uuid: string) {
    return this._sources.has(uuid)
  }

  /**
   * Remove source
   */
  remove(uuid: string) {
    if (this._sources.has(uuid)) {
      const item = this._sources.get(uuid) as Source
      this._sources.delete(uuid)
      return item
    }
  }

  /**
   * Return all sources
   */
  all(type?: "array"): Source[]
  all(type: "object"): Record<string, Source>
  all(type: "array" | "object" = "array"): any {
    switch (type) {
      case "array": return [...this._sources.values()]
      case "object": {
        const o: Record<string, Source> = {}
        for (const source of this._sources.values()) {
          o[source.uuid] = source
        }
        return o
      }
    }
  }

  fetch(type: "file" | "directory") {
    for (const source of this._sources.values()) {
      source[type].fetch()
    }
  }

  async copy(force = false) {
    for (const source of this._sources.values()) {
      await source.fs.apply(force)
    }
  }

}

export class Source {

  uuid = guid()
  file: FilePipeline
  directory: DirectoryPipeline
  fs: FileSystem
  path: PathBuilder
  fullpath: PathBuilder

  constructor(path: string, pid: string) {
    const pipeline = PipelineManager.get(pid)!
    this.path = new PathBuilder(path)
    this.fullpath = new PathBuilder(Path.isAbsolute(path) ?
      path :
      pipeline!.cwd.join(path).os()
    )
    this.file = new FilePipeline(pid, this.uuid)
    this.directory = new DirectoryPipeline(pid, this.uuid)
    this.fs = new FileSystem(pid, this.uuid)
  }

}