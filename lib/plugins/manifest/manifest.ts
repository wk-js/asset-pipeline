import { readFileSync, writeFileSync } from "fs";
import { isFile, removeSync } from "lol/js/node/fs";
import { PathBuilder } from "../../path/path";
import { Pipeline } from "../../pipeline";
import { ManifestFile } from "./types";

export class Manifest {
  saveOnDisk = true
  path = new PathBuilder("tmp/manifest.json")
  file: ManifestFile = {
    saltKey: "none",
    date: new Date().toISOString(),
    entries: [],
    aliases: []
  }

  constructor(protected pipeline: Pipeline) {}

  set(content: ManifestFile) {
    this.file = content
    this.pipeline.rules.saltKey = this.file.saltKey
    this.pipeline.files.entries = this.file.entries.map(item => item[0])
    this.pipeline.resolver['_paths'] = this.file.entries
    this.pipeline.resolver['_aliases'] = this.file.aliases.map(alias => new PathBuilder(alias))
  }

  /**
   * Check if manifest file is created
   */
  exists() {
    return this.saveOnDisk && isFile(this.path.unix())
  }

  /**
   * Save manifest file
   */
  save() {
    this.file.saltKey = this.pipeline.rules.saltKey
    this.file.date = new Date().toISOString()
    this.file.entries = this.pipeline.resolver['_paths']

    if (this.saveOnDisk) {
      writeFileSync(this.path.unix(), JSON.stringify(this.file, null, 2), )
    }
  }

  /**
   * Read manifest file
   */
  read() {
    const path = this.path.unix()
    if (this.saveOnDisk && isFile(path)) {
      const content = readFileSync(path)
      const file = JSON.parse(content.toString('utf-8'))
      this.set(file)
    }
  }

  /**
   * Remove manifest file
   */
  delete() {
    const path = this.path.unix()
    if (isFile(path)) {
      removeSync(path)
    }
  }

}