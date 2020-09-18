import "mocha";
import { join } from "path";
import { AssetPipeline } from "../lib"
import { ensureDirSync, isDirectory, removeSync, writeFileSync } from "lol/js/node/fs";
import { deep_clone, omit } from "lol/js/object";
import { IAsset } from "../lib/types";
import { statSync, unlinkSync } from "fs";

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

    p.shadow.addFile("main.css")

    if (callback) await callback(p)
  })
}

export function getAsset(path: string, p: AssetPipeline) {
  let asset = p.manifest.getAsset(path)
  if (!asset) return null
  asset = deep_clone(asset) as IAsset
  asset.source = omit(asset.source, "uuid")
  return asset
}

export function manifestGetAsset(path: string, p: AssetPipeline) {
  let asset = p.manifest.getAsset(path)
  if (!asset) return null
  asset = deep_clone(asset) as IAsset
  asset.source = omit(asset.source, "uuid")
  return asset
}

export function manifestGetAssetWithSource(path: string, p: AssetPipeline) {
  return p.manifest.getAssetWithSource(path)
}

export function getAssetFromOutput(path: string, p: AssetPipeline) {
  let asset = p.manifest.findAssetFromOutput(path)
  if (!asset) return undefined
  asset = deep_clone(asset) as IAsset
  asset.source = omit(asset.source, "uuid")
  return asset
}

function isSymbolicLink(path: string) {
  try {
    const { isSymbolicLink } = statSync(path)
    return isSymbolicLink()
  } catch (e) {}

  return false
}

function _before() {
  ensureDirSync(LOAD_PATH)
  writeFileSync("", join(LOAD_PATH, "app/scripts/main.ts"))
  writeFileSync("", join(LOAD_PATH, "app/styles/common.styl"))
  writeFileSync("", join(LOAD_PATH, "app/views/_layout.html.ejs"))
  writeFileSync("", join(LOAD_PATH, "app/views/index.html.ejs"))
  writeFileSync("", join(LOAD_PATH, "app/assets/flags.png"))
  writeFileSync("", join(LOAD_PATH, "app/assets/emoji/emoji0.png"))
  writeFileSync("", join(LOAD_PATH, "app/assets/emoji/emoji1.png"))
  writeFileSync("", join(LOAD_PATH, "app/assets/emoji/emoji2.png"))
}

function _after() {
  if (isSymbolicLink(join(DST_PATH, "assets"))) unlinkSync(join(DST_PATH, "assets"))
  if (isDirectory(DST_PATH)) removeSync(DST_PATH)
  if (isDirectory(LOAD_PATH)) removeSync(LOAD_PATH)
}

before(_before)
beforeEach(_before)
after(_after)
afterEach(_after)