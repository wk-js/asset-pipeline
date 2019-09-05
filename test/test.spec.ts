import "mocha";
import { AssetPipeline } from "../lib/index";
import { writeFile, ensureDir, removeDir, fetch, isDirectory } from "lol/js/node/fs";
import Path, { join } from "path";
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
      AP.file.add('file7.txt', { output: 'file.txt' })
    })

    AP.resolve.path('file7.txt')
    assert.equal(AP.resolve.path('file7.txt'), 'file.txt');
    assert.equal(AP.resolve.source('file.txt') , 'tmp/test-units/sub2/file7.txt');
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
      AP.file.add('file1.txt', { output: "#{output.dir}/#{output.name}#{output.ext}?v=1" })
      AP.file.add('file.txt.ejs', { output: "#{output.name}" })
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

  it('Urls', async () => {
    const AP0 = await setup(async (AP0) => {
      AP0.source.add( LOAD_PATH )
      AP0.file.add('file1.txt', { output: "#{output.dir}/#{output.name}#{output.ext}?v=1" })
      AP0.file.add('file.txt.ejs', { output: "#{output.name}" })
    })

    AP0.manifest.all().forEach((asset) => {
      if (asset.input.match(/file1\.txt/)) {
        assert.equal(AP0.resolve.url(asset.input), '/file1.txt?v=1')
        assert.equal(AP0.resolve.clean_url(asset.input), '/file1.txt')
      } else {
        assert.equal(AP0.resolve.url(asset.input), '/file.txt')
        assert.equal(AP0.resolve.clean_url(asset.input), '/file.txt')
      }
    })

    const AP1 = await setup(async (AP1) => {
      AP1.resolve.host = 'http://mycdn.com/'
      AP1.source.add( LOAD_PATH )
      AP1.file.add('file1.txt', { output: "#{output.dir}/#{output.name}#{output.ext}?v=1" })
      AP1.file.add('file.txt.ejs', { output: "#{output.name}" })
    })

    AP1.manifest.all().forEach((asset) => {
      if (asset.input.match(/file1\.txt/)) {
        assert.equal(AP1.resolve.url(asset.input), 'http://mycdn.com/file1.txt?v=1')
        assert.equal(AP1.resolve.clean_url(asset.input), 'http://mycdn.com/file1.txt')
      } else {
        assert.equal(AP1.resolve.url(asset.input), 'http://mycdn.com/file.txt')
        assert.equal(AP1.resolve.clean_url(asset.input), 'http://mycdn.com/file.txt')
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
        output: "r_sub0/r_sub1",
        cache: false,
        file_rules: [
          {
            glob: "sub0/sub1/file7.txt",
            ignore: true
          },
          {
            glob: "sub0/sub1/file8.txt",
            output: "#{output.dir}/#{output.name}#{output.ext}",
            cache: "#{output.dir}/#{output.name}#{output.ext}?#{output.hash}",
          },
          {
            glob: "sub0/sub1/file9.txt",
            cache: true,
            output: "#{output.name}#{output.ext}",
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
    view.push('      file8.txt?be9e18aeae58a8f993b04f2465f90bae')
    view.push('  file9-a753a6e8378ee3ee03118da83d861934.txt')

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
      AP.directory.add("others", { output: "hello" })
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
        output({ input }) {
          return Path.join('world', input.base)
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

describe('Shadow', () => {

  it('Add shadow files', async () => {
    const AP = await setup(async (AP) => {
      AP.cache.enabled = true
      AP.source.add(LOAD_PATH)
      AP.file.add("others/**/*", {
        output: "world/#{output.base}"
      })
      AP.fs.copy("others/**/*") // Need wildcards
    })

    AP.file.shadow('vendor.js')

    await AP.fetch()

    const assets = AP.manifest.all()
    assert.equal(assets.length, 4)
    assert.deepEqual(AP.manifest.get('vendor.js'), {
      source: '__shadow__',
      input: 'vendor.js',
      output: 'vendor.js',
      cache: 'vendor-559ea07a8ceb627e2313b5e790fc38a7.js',
      resolved: true,
      rule: { glob: 'vendor.js/**/*' },
      tag: 'default'
    })
  })

  it('Add shadow directories', async () => {
    const AP = await setup(async (AP) => {
      AP.cache.enabled = true
      AP.source.add(LOAD_PATH)
      AP.file.add("others/**/*", {
        output: "world/#{output.base}"
      })
      AP.fs.copy("others/**/*") // Need wildcards
    })

    AP.directory.shadow('vendors')

    await AP.fetch()

    const assets = AP.manifest.all()
    assert.equal(assets.length, 4)
    assert.deepEqual(AP.manifest.get('vendors'), {
      source: '__shadow__',
      input: 'vendors',
      output: 'vendors',
      cache: 'vendors-db132a11993302685852d70b555e94aa',
      resolved: true,
      rule: { glob: 'vendors/**/*' },
      tag: 'default'
    })
  })

})