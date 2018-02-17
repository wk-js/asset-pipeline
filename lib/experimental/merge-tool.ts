import { AssetPipeline, AssetItemRules } from "../asset-pipeline";
import { merge } from "lol/utils/object";

export class MergeTool {

  static fetch_data(...pipelines:AssetPipeline[]) {
    const data = {}

    for (let i = 0, ilen = pipelines.length; i < ilen; i++) {
      merge(data, pipelines[i].data)
    }

    return data
  }

  static fetch_assets(...pipelines:AssetPipeline[]) {
    const assets = {}

    for (let i = 0, ilen = pipelines.length; i < ilen; i++) {
      merge(assets, pipelines[i].manifest.manifest.assets)
    }

    return assets
  }

  static fetch_rules(...pipelines:AssetPipeline[]) {
    let file:AssetItemRules[] = []
    let directory:AssetItemRules[] = []

    for (let i = 0, ilen = pipelines.length; i < ilen; i++) {
      file = file.concat( pipelines[i].file.rules )
      directory = directory.concat( pipelines[i].directory.rules )
    }

    return { file, directory }
  }

}