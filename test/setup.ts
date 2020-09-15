import "mocha";
import { join } from "path";
import { AssetPipeline } from "../lib"
import { ensureDirSync, isDirectory, removeSync, writeFileSync } from "lol/js/node/fs";
import { omit } from "lol/js/object";

export const LOAD_PATH = 'tmp/test-units'
export const DST_PATH = 'tmp/test-units-dist'

export async function setup(callback?: (p: AssetPipeline) => Promise<void>) {
  const p = new AssetPipeline("asset")
  p.cwd.set(join(process.cwd(), LOAD_PATH))
  p.output.set(DST_PATH)
  p.manifest.saveOnDisk = false
  if (callback) await callback(p)
  p.fetch(true)
  return p
}

export function setupWithSourcesAdded(callback?: (p: AssetPipeline) => Promise<void>) {
  return setup(async p => {
    const scripts = p.source.add("app/scripts")
    scripts.file.shadow("main.css")
    scripts.file.add("main.ts", {
      output: { ext: ".js" }
    })

    const styles = p.source.add("app/styles")
    styles.file.add("**/*.styl", {
      output: { ext: ".css" }
    })

    const views = p.source.add("app/views")
    views.file.ignore("**/_*.html.ejs")
    views.file.add("**/*.html.ejs", {
      output: { ext: "" },
      cache: false
    })

    if (callback) await callback(p)
  })
}

export function getAsset(path: string, p: AssetPipeline) {
  const asset = p.getAsset(path)
  if (!asset) return null
  asset.source = omit(asset.source, "uuid")
  return asset
}

export function getAssetFromOutput(path: string, p: AssetPipeline) {
  const asset = p.getAssetFromOutput(path)
  if (!asset) return null
  asset.source = omit(asset.source, "uuid")
  return asset
}

before(() => {
  ensureDirSync(LOAD_PATH)
  writeFileSync("", join(LOAD_PATH, "app/scripts/main.ts"))
  writeFileSync("", join(LOAD_PATH, "app/styles/common.styl"))
  writeFileSync("", join(LOAD_PATH, "app/views/_layout.html.ejs"))
  writeFileSync("", join(LOAD_PATH, "app/views/index.html.ejs"))
  writeFileSync("", join(LOAD_PATH, "app/assets/flags.png"))
  writeFileSync("", join(LOAD_PATH, "app/assets/emoji/emoji0.png"))
  writeFileSync("", join(LOAD_PATH, "app/assets/emoji/emoji1.png"))
  writeFileSync("", join(LOAD_PATH, "app/assets/emoji/emoji2.png"))
})

after(() => {
  if (isDirectory(LOAD_PATH)) removeSync(LOAD_PATH)
})