import { AssetPipeline, AssetItem } from "./asset-pipeline";
import { writeFile, isFile, readFile, remove } from "./utils/fs";

export interface ManifestFile {
  asset_key: string | number;
  date: Date;
  load_path: string[];
  dst_path: string;
  assets: Record<string, AssetItem>
}

export class Manifest {

  manifest:ManifestFile = {
    asset_key: this.pipeline.asset_key,
    date: new Date,
    load_path: [],
    dst_path: this.pipeline.dst_path,
    assets: {} as { [key:string]: AssetItem }
  }

  constructor(public pipeline: AssetPipeline) {}

  get manifest_path() {
    return `tmp/manifest-${this.pipeline.asset_key}.json`
  }

  fileExists() {
    return this.pipeline.save_manifest && isFile(this.manifest_path)
  }

  async createFile() {
    this.manifest.asset_key = this.pipeline.asset_key
    this.manifest.date      = new Date
    this.manifest.load_path = this.pipeline.load_paths.get_paths()
    this.manifest.dst_path  = this.pipeline.dst_path

    if (this.pipeline.save_manifest) {
      await writeFile( JSON.stringify(this.manifest, null, 2), this.manifest_path )
    }
  }

  updateFile() {
    return this.createFile()
  }

  async readFile() {
    if (isFile(this.manifest_path)) {
      const content = await readFile( this.manifest_path )
      this.manifest = JSON.parse( content.toString('utf-8') )
    }

    if (this.pipeline.save_manifest) {
      await this.createFile()
    }
  }

  async deleteFile() {
    if (isFile(this.manifest_path)) {
      await remove(this.manifest_path)
    }
  }

}