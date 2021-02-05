import { FileList } from "./file-list"
import { Resolver } from "./resolver"
import { PathBuilder } from "./path"
import { Transformer } from "./transformer"
import { Emitter } from "lol/js/emitter"
import { PipelineEvents, PipelinePlugin } from "./types"
import { verbose } from "./logger"

export class Pipeline {
  files = new FileList()
  rules = new Transformer()
  resolver = new Resolver()
  events = new Emitter<PipelineEvents>()
  protected _plugins = new Set<string>()
  protected _options = new Map<string, any>()

  get logging() {
    return verbose()
  }

  set logging(value: boolean) {
    verbose(value)
  }

  createPath(path: string) {
    return new PathBuilder(path)
  }

  fetch(forceResolve?: boolean) {
    const files = this.files.resolve(forceResolve)
    this.events.dispatch("resolved", files)
    const paths = this.rules.transform(this.files.entries)
    this.resolver.set(paths)
    this.events.dispatch("transformed", paths)
  }

  options(key: string, value?: any):  any {
    if (value) {
      this._options.set(key, value)
    }
    return this._options.get(key)
  }

  async plugin(plugin: PipelinePlugin) {
    if (this._plugins.has(plugin.name)) {
      return
    }

    this._plugins.add(plugin.name)

    const res = plugin.setup(this)
    if (res && typeof res === "object" && typeof res.then) {
      await res
    }
  }
}