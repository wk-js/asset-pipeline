import "mocha";
import { AssetPipeline } from "../lib/index";
import { writeFile, ensureDir, removeDir, fetch, isDirectory } from "../lib/utils/fs";
import Path, { basename, join, normalize } from "path";
import * as assert from "assert";
import { Pipeline } from "../lib/pipeline";
import { to_unix_path } from "../lib/utils/path";

const LOAD_PATH = 'tmp/test-units'
const DST_PATH = 'tmp/test-units-dist'

async function setup(callback: (pipeline: Pipeline) => void) {
  const AP = new AssetPipeline()
  // AP.load_paths.add( LOAD_PATH )
  AP.dst_path = DST_PATH
  AP.manifest.save = false
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

  await ensureDir(Path.join(LOAD_PATH, 'sub2'))
  await writeFile("", Path.join(LOAD_PATH, 'sub2', 'file7.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub2', 'file8.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub2', 'file9.txt'))
})

after(async () => {
  await removeDir(LOAD_PATH)
})

afterEach(async () => {
  if (isDirectory(DST_PATH)) await removeDir(DST_PATH)
})

describe("Load paths", () => {

  it("Override asset path", async () => {
    const AP = await setup(async (AP) => {
      AP.load_paths.add(Path.join(LOAD_PATH, 'sub0/sub1'))
      AP.load_paths.add(Path.join(LOAD_PATH, 'sub2'))
      AP.file.add('**/*')
    })

    const assets = Object.keys(AP.manifest.manifest.assets).map((key) => to_unix_path(key))
    assert.equal(assets.length, 3)
    assert.deepEqual(assets, ['file7.txt', 'file8.txt', 'file9.txt'])
    assert.deepEqual(Object.keys(AP.manifest.manifest.assets).map((key) => {
      return to_unix_path(AP.manifest.manifest.assets[key].load_path)
    }), [ 'tmp/test-units/sub0/sub1', 'tmp/test-units/sub0/sub1', 'tmp/test-units/sub0/sub1' ])
  })

  it('Get source file path', async () => {
    const AP = await setup(async (AP) => {
      AP.load_paths.add(Path.join(LOAD_PATH, 'sub2'))
      AP.file.add('file7.txt', { rename: 'file.txt' })
    })

    const assets = Object.keys(AP.manifest.manifest.assets).map((key) => to_unix_path(key))
    AP.resolver.getPath('file7.txt')
    assert.equal(AP.resolver.getPath('file7.txt'), 'file.txt');
    assert.equal(AP.resolver.getSourceFilePath('file.txt') , 'tmp/test-units/sub2/file7.txt');

  })

})

describe("Directory", () => {

  it("Add directory", async () => {
    const AP = await setup(async (AP) => {
      AP.load_paths.add(join(LOAD_PATH))
      AP.directory.add('others')
    })
    assert.equal(AP.manifest.manifest.assets.hasOwnProperty('others'), true)
  })

  it("Add directories", async () => {
    const AP = await setup(async (AP) => {
      AP.load_paths.add(join(LOAD_PATH, 'sub0'))
      AP.directory.add("**/**")
    })

    const assets = Object.keys(AP.manifest.manifest.assets).map((key) => to_unix_path(key))
    assert.equal(assets.length, 4)
    assert.deepEqual(assets, [ 'sub1', 'sub1/file7.txt', 'sub1/file8.txt', 'sub1/file9.txt' ])
  })

  it('file_rules[] and couple rules', async () => {
    const AP = await setup(async (AP) => {
      AP.cacheable = true
      AP.load_paths.add( LOAD_PATH )
      AP.directory.add('sub0/sub1', {
        keep_path: false,
        rename: "r_sub0/r_sub1",
        file_rules: [
          {
            glob: "sub0/sub1/file7.txt",
            ignore: true
          },
          {
            glob: "sub0/sub1/file8.txt",
            rename: "#{dir}/#{name}#{ext}?#{hash}",
          },
          {
            glob: "sub0/sub1/file9.txt",
            cache: true,
            rename: "#{name}#{ext}?#{hash}",
          }
        ]
      })
    })

    const assets = Object.keys(AP.manifest.manifest.assets).map((key) => to_unix_path(key))
    assert.equal(assets.length, 3)
    assert.deepEqual(assets, [ 'sub0/sub1', 'sub0/sub1/file8.txt', 'sub0/sub1/file9.txt' ])

    const view = []
    view.push('r_sub0')
    view.push('  r_sub1')
    view.push('    file8.txt?')
    view.push('file9.txt?2ad93d4838a65697a68da7e6ff4cc758')

    assert.equal(AP.resolver.view(), view.join('\n'));
  })

})

describe('Directory (FS)', () => {

  it("Copy directory", async () => {
    const AP = await setup(async (AP) => {
      AP.load_paths.add(LOAD_PATH)
      AP.directory.add("others")
      AP.fs.copy("others/**/*") // Need wildcards
    })

    await AP.fs.apply()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/others/file4.txt',
      'tmp/test-units-dist/others/file5.txt',
      'tmp/test-units-dist/others/file6.txt',
    ])
  })

  it("Copy renamed directory", async () => {
    const AP = await setup(async (AP) => {
      AP.load_paths.add(LOAD_PATH)
      AP.directory.add("others", { rename: "hello" })
      AP.fs.copy("others/**/*") // Need wildcards
    })

    await AP.fs.apply()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/hello/file4.txt',
      'tmp/test-units-dist/hello/file5.txt',
      'tmp/test-units-dist/hello/file6.txt',
    ])
  })

  it("Copy and use rename() method", async () => {
    const AP = await setup(async (AP) => {
      AP.load_paths.add(LOAD_PATH)
      AP.file.add("others/**/*", {
        rename(output, file, rules) {
          return Path.join('world', basename(output))
        }
      })
      AP.fs.copy("others/**/*") // Need wildcards
    })

    await AP.fs.apply()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/world/file4.txt',
      'tmp/test-units-dist/world/file5.txt',
      'tmp/test-units-dist/world/file6.txt',
    ])
  })

})