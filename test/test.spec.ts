import "mocha";
import { AssetPipeline } from "../js/asset-pipeline";
import { writeFile, ensureDir } from "../js/utils/fs";
import Path from "path";
import * as assert from "assert";

const ROOT_PATH = 'tmp/test-units'

async function setup(callback: (pipeline: AssetPipeline) => void) {
  const AP = new AssetPipeline()
  AP.load_path = ROOT_PATH
  AP.dst_path = 'tmp/dist'
  AP.save_manifest = false
  await callback(AP)
  await AP.resolve()
  return AP
}

before(async () => {
  await ensureDir(ROOT_PATH)
  await writeFile("", Path.join(ROOT_PATH, 'file1.txt'))
  await writeFile("", Path.join(ROOT_PATH, 'file2.txt'))
  await writeFile("", Path.join(ROOT_PATH, 'file3.txt'))

  await ensureDir(Path.join(ROOT_PATH, 'others'))
  await writeFile("", Path.join(ROOT_PATH, 'others', 'file4.txt'))
  await writeFile("", Path.join(ROOT_PATH, 'others', 'file5.txt'))
  await writeFile("", Path.join(ROOT_PATH, 'others', 'file6.txt'))

  await ensureDir(Path.join(ROOT_PATH, 'sub0', 'sub1'))
  await writeFile("", Path.join(ROOT_PATH, 'sub0/sub1', 'file7.txt'))
  await writeFile("", Path.join(ROOT_PATH, 'sub0/sub1', 'file8.txt'))
  await writeFile("", Path.join(ROOT_PATH, 'sub0/sub1', 'file9.txt'))
})

describe("Add file", () => {

  it("Add directory", async () => {
    const AP = await setup(async (AP) => {
      AP.addDirectory('others')
    })
    assert.equal(AP.manifest.manifest.assets.hasOwnProperty('others'), true)
  })

  it("Add directories", async () => {
    const AP = await setup(async (AP) => {
      AP.addDirectory("**/**")
    })
    const assets = Object.keys(AP.manifest.manifest.assets)
    assert.equal(assets.length, 3)
  })

})