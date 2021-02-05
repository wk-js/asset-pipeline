import "./types"
import { statSync, symlinkSync } from "fs";
import { fetch, fetchDirs, copy, move, ensureDirSync } from "lol/js/node/fs";
import { PathBuilder, PathOrString, toUnixString } from "../../path/path";
import { Pipeline } from "../../pipeline";
import { FSRuleEntry } from "./types";
import { chunk } from "lol/js/array/array";
import { dirname } from "path";
import { Emitter } from "lol/js/emitter";
import { PipelineEvents } from "../../types";
import { Resolver } from "../../resolver";
import { info } from "../../logger";
import { cleanup } from "../../path/utils";

const PATH = new PathBuilder("")

export class FileSystem {

  chunkCount = 15
  private mtimes = new Map<string, Date>()
  private globs: FSRuleEntry[] = []
  resolver: Resolver
  events: Emitter<PipelineEvents>

  constructor(pipeline: Pipeline) {
    this.events = pipeline.events
    this.resolver = pipeline.resolver
  }

  /**
   * Register a path or a glob pattern for a move
   */
  move(glob: PathOrString) {
    this.globs.push({
      glob: toUnixString(glob),
      action: 'move'
    })
  }

  /**
   * Register a path or a glob pattern for a copy
   */
  copy(glob: PathOrString) {
    this.globs.push({
      glob: toUnixString(glob),
      action: 'copy'
    })
  }

  /**
   * Register a path or a glob pattern for a symlink
   */
  symlink(glob: PathOrString) {
    this.globs.push({
      glob: toUnixString(glob),
      action: 'symlink'
    })
  }

  /**
   * Register a path or a glob pattern to ignore
   */
  ignore(glob: PathOrString) {
    this.globs.push({
      glob: toUnixString(glob),
      action: 'ignore'
    })
  }

  /**
   * Perform move/copy/symlink
   */
  async apply(force = false) {
    if (force) this.mtimes.clear()
    const types = ['move', 'copy', 'symlink']
    for (let i = 0; i < types.length; i++) {
      await this._apply(types[i])
    }
  }

  protected async _apply(type: string) {
    const validGlobs = this.globs
      .filter(glob => glob.action === type)
      .map(glob => PATH.set(glob.glob).unix())

    const ignoredGlobs = this.globs
      .filter(glob => glob.action === "ignore")
      .map(glob => PATH.set(glob.glob).unix())

    let files = (
      type === 'symlink' ?
        fetchDirs(validGlobs, ignoredGlobs)
        :
        fetch(validGlobs, ignoredGlobs)
    )

    let ios: [string, string][] = []
    files.forEach(file => {
      const input = PATH.set(file).unix()
      const output = this.resolver.getOutputPath(file)

      if (input !== output) {
        return ios.push([input, cleanup(output)])
      }
    })

    ios = ios.filter(io => {
      const { mtime } = statSync(io[0])

      if (this.mtimes.has(io[0])) {
        const prev = this.mtimes.get(io[0])!
        if (mtime <= prev) return false
      }

      this.mtimes.set(io[0], mtime)
      return true
    })

    if (ios.length === 0) return

    for (const items of chunk(ios, this.chunkCount)) {
      const ps = items.map(io => {
        info("[fs]", type, ...io)

        if (type === 'copy') {
          return copy(io[0], io[1])
        } else if (type === 'move') {
          return move(io[0], io[1])
        } else if (type === 'symlink') {
          try {
            ensureDirSync(dirname(io[1]))
            symlinkSync(io[0], io[1], "junction")
            return Promise.resolve(true)
          } catch (e) {
            return Promise.resolve(false)
          }
        }
      })

      await Promise.all(ps)
    }

    this.events.dispatch("newfilecopied", ios)
  }
}