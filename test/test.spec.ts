import "mocha";
import { AssetPipeline } from "../js/asset-pipeline";
import { writeFile, ensureDir, remove, removeDir, fetch, isDirectory } from "../js/utils/fs";
import Path from "path";
import * as assert from "assert";

const LOAD_PATH = 'tmp/test-units'
const DST_PATH = 'tmp/test-units-dist'

async function setup(callback: (pipeline: AssetPipeline) => void) {
  const AP = new AssetPipeline()
  AP.load_path = LOAD_PATH
  AP.dst_path = DST_PATH
  AP.save_manifest = false
  await callback(AP)
  await AP.resolve()
  return AP
}

before(async () => {
  await ensureDir(LOAD_PATH)
  await writeFile("", Path.join(LOAD_PATH, 'file1.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file2.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file3.txt'))

  await ensureDir(Path.join(LOAD_PATH, 'others'))
  await writeFile("", Path.join(LOAD_PATH, 'others', 'file4.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'others', 'file5.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'others', 'file6.txt'))

  await ensureDir(Path.join(LOAD_PATH, 'sub0', 'sub1'))
  await writeFile("", Path.join(LOAD_PATH, 'sub0/sub1', 'file7.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub0/sub1', 'file8.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub0/sub1', 'file9.txt'))
})

after(async () => {
  await removeDir(LOAD_PATH)
})

afterEach(async () => {
  if (isDirectory(DST_PATH)) await removeDir(DST_PATH)
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

  it("Copy directory", async () => {
    const AP = await setup(async (AP) => {
      AP.addDirectory("others")
      AP.manager.copy("others/**/*") // Need wildcards
    })

    await AP.manager.process()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/others/file4.txt',
      'tmp/test-units-dist/others/file5.txt',
      'tmp/test-units-dist/others/file6.txt',
    ])
  })

  it("Copy renamed directory", async () => {
    const AP = await setup(async (AP) => {
      AP.addDirectory("others", { glob: "others", rename: "hello" })
      AP.addFile("others/**/*") // You need to add files into the manifest
      AP.manager.copy("others/**/*") // Need wildcards
    })

    await AP.manager.process()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/hello/file4.txt',
      'tmp/test-units-dist/hello/file5.txt',
      'tmp/test-units-dist/hello/file6.txt',
    ])
  })

})