import "mocha";
import { AssetPipeline } from "../lib/index";
import { writeFile, ensureDir, removeDir, fetch, isDirectory } from "../lib/utils/fs";
import Path, { basename, join } from "path";
import * as assert from "assert";
import { Pipeline } from "../lib/pipeline";
import { toUnixPath } from "../lib/utils/path";

const LOAD_PATH = 'tmp/test-units'
const DST_PATH = 'tmp/test-units-dist'

async function setup(callback: (pipeline: Pipeline) => void) {
  const AP = new AssetPipeline("test")
  // AP.source.add( LOAD_PATH )
  AP.resolve.output(DST_PATH)
  AP.manifest.save = false
  await callback(AP)
  await AP.fetch()
  return AP
}

before(async () => {
  await ensureDir(LOAD_PATH)
  await writeFile("", Path.join(LOAD_PATH, 'file1.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file2.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file3.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file.txt.ejs'))

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

  await ensureDir(Path.join(LOAD_PATH, 'sub3'))
  await writeFile("", Path.join(LOAD_PATH, 'sub3', 'file10.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub3', 'file11.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub3', 'file12.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub3', '_file13.txt'))
})

after(async () => {
  await removeDir(LOAD_PATH)
})

afterEach(async () => {
  if (isDirectory(DST_PATH)) await removeDir(DST_PATH)
})

describe("Files", () => {

  it("Override asset path", async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(Path.join(LOAD_PATH, 'sub0/sub1'))
      AP.source.add(Path.join(LOAD_PATH, 'sub2'))
      AP.file.add('**/*')
    })

    const assets = AP.manifest.all()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.input), ['file7.txt', 'file8.txt', 'file9.txt'])
    assert.deepEqual(assets.map((asset) => asset.source), [
      'tmp/test-units/sub0/sub1',
      'tmp/test-units/sub0/sub1',
      'tmp/test-units/sub0/sub1'
    ])
  })

  it('Get source file path', async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(Path.join(LOAD_PATH, 'sub2'))
      AP.file.add('file7.txt', { rename: 'file.txt' })
    })

    AP.resolve.path('file7.txt')
    assert.equal(AP.resolve.path('file7.txt'), 'file.txt');
    // assert.equal(AP.resolve.source('file.txt') , 'tmp/test-units/sub2/file7.txt');
  })

  it('Ignore', async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(Path.join(LOAD_PATH, 'sub3'))
      AP.file.add('**/*.txt')
      AP.file.ignore('**/_*.txt')
    })

    const assets = AP.manifest.all()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.input), ['file10.txt', 'file11.txt', 'file12.txt'])
  })

  it('Paths', async () => {
    const AP = await setup(async (AP) => {
      AP.resolve.host = 'http://mycdn.com/'
      AP.source.add( LOAD_PATH )
      AP.file.add('file1.txt', { rename: "#{dir}/#{name}#{ext}?v=1" })
      AP.file.add('file.txt.ejs', { rename: "#{name}" })
    })

    AP.manifest.all().forEach((asset) => {
      if (asset.input.match(/file1\.txt/)) {
        assert.equal(AP.resolve.path(asset.input), 'file1.txt?v=1')
        assert.equal(AP.resolve.url(asset.input), 'http://mycdn.com/file1.txt?v=1')
        assert.equal(AP.resolve.clean_path(asset.input), 'file1.txt')
        assert.equal(AP.resolve.clean_url(asset.input), 'http://mycdn.com/file1.txt')
        assert.equal(AP.resolve.source(asset.output), 'tmp/test-units/file1.txt')
        assert.equal(AP.resolve.source(asset.output, true), toUnixPath(join(__dirname, '../tmp/test-units/file1.txt')))
        assert.deepEqual(AP.resolve.parse(toUnixPath(join(__dirname, '../tmp/test-units/file1.txt'))), {
          relative: "tmp/test-units/file1.txt",
          full: toUnixPath(join(__dirname, '../tmp/test-units/file1.txt')),
          source: "tmp/test-units",
          key: "file1.txt"
        })
      } else {
        assert.equal(AP.resolve.path(asset.input), 'file.txt')
        assert.equal(AP.resolve.url(asset.input), 'http://mycdn.com/file.txt')
        assert.equal(AP.resolve.clean_path(asset.input), 'file.txt')
        assert.equal(AP.resolve.clean_url(asset.input), 'http://mycdn.com/file.txt')
        assert.equal(AP.resolve.source(asset.output), 'tmp/test-units/file.txt.ejs')
        assert.equal(AP.resolve.source(asset.output, true), toUnixPath(join(__dirname, '../tmp/test-units/file.txt.ejs')))
        assert.deepEqual(AP.resolve.parse(toUnixPath(join(__dirname, '../tmp/test-units/file.txt.ejs'))), {
          relative: "tmp/test-units/file.txt.ejs",
          full: toUnixPath(join(__dirname, '../tmp/test-units/file.txt.ejs')),
          source: "tmp/test-units",
          key: "file.txt.ejs"
        })
      }
    })
  })

})

describe("Directory", () => {

  it("Add directory", async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(join(LOAD_PATH))
      AP.directory.add('others')
    })
    assert.equal(AP.manifest.has('others'), true)
  })

  it("Add directories", async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(join(LOAD_PATH, 'sub0'))
      AP.directory.add("**/**")
    })

    const assets = AP.manifest.all()
    assert.equal(assets.length, 4)
    assert.deepEqual(assets.map((asset) => asset.input), [ 'sub1', 'sub1/file7.txt', 'sub1/file8.txt', 'sub1/file9.txt' ])
  })

  it('file_rules[] and couple rules', async () => {
    const AP = await setup(async (AP) => {
      AP.cache.enabled = true
      AP.source.add( LOAD_PATH )
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

    const assets = AP.manifest.all()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.input), [ 'sub0/sub1', 'sub0/sub1/file8.txt', 'sub0/sub1/file9.txt' ])

    const view = []
    view.push('tmp/test-units-dist')
    view.push('  r_sub0')
    view.push('    r_sub1')
    view.push('      file8.txt?')
    view.push('  file9.txt?2ad93d4838a65697a68da7e6ff4cc758')

    assert.equal(AP.tree.view(), view.join('\n'));
  })

})

describe('Directory (FS)', () => {

  it("Copy directory", async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(LOAD_PATH)
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
      AP.source.add(LOAD_PATH)
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
      AP.source.add(LOAD_PATH)
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