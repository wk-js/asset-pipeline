import "mocha";
import { AssetPipeline } from "../lib/index";
import { writeFile, ensureDir, removeDir, fetch, isDirectory } from "lol/js/node/fs";
import Path, { join } from "path";
import * as assert from "assert";
import { Pipeline } from "../lib/pipeline";
import { exec } from "lol/js/node/exec"
import { normalize } from "../lib/path";

const LOAD_PATH = 'tmp/test-units'
const DST_PATH = 'tmp/test-units-dist'

async function setup(callback: (pipeline: Pipeline) => Promise<void>) {
  const AP = new AssetPipeline("test")
  // AP.source.add( LOAD_PATH )
  AP.resolve.output(DST_PATH)
  AP.manifest.saveOnDisk = false
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
  if (isDirectory(LOAD_PATH)) await removeDir(LOAD_PATH)
})

afterEach(async () => {
  if (isDirectory(DST_PATH)) await removeDir(DST_PATH)
})

describe("Files", () => {

  it("Override asset path", async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(Path.join(LOAD_PATH, 'sub0/sub1'))
        .file.add("**/*")
      AP.source.add(Path.join(LOAD_PATH, 'sub2'))
        .file.add("**/*")
    })

    const assets = AP.manifest.export()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.input), ['file7.txt', 'file8.txt', 'file9.txt'])
    assert.deepEqual(assets.map((asset) => asset.source.path), [
      'tmp/test-units/sub0/sub1',
      'tmp/test-units/sub0/sub1',
      'tmp/test-units/sub0/sub1'
    ])
  })

  it('Get source file path', async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(Path.join(LOAD_PATH, 'sub2'))
        .file.add('file7.txt', { output: 'file.txt' })
    })

    AP.resolve.getPath('file7.txt')
    assert.equal(AP.resolve.getPath('file7.txt'), 'file.txt');
    assert.equal(AP.resolve.getInputFromOutput('file.txt'), 'tmp/test-units/sub2/file7.txt');
  })

  it('Ignore', async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(Path.join(LOAD_PATH, 'sub3'))
        .file.add('**/*.txt').ignore('**/_*.txt')
    })

    const assets = AP.manifest.export()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.input), ['file10.txt', 'file11.txt', 'file12.txt'])
  })

  it('Paths', async () => {
    const AP = await setup(async (AP) => {
      AP.resolve.host = 'http://mycdn.com/'
      AP.source.add(LOAD_PATH)
        .file
        .add('file1.txt', { output: "#{output.dir}/#{output.name}#{output.ext}?v=1" })
        .add('file.txt.ejs', { output: "#{output.name}" })
    })

    AP.manifest.export().forEach((asset) => {
      if (asset.input.match(/file1\.txt/)) {
        assert.equal(AP.resolve.getPath(asset.input), 'file1.txt?v=1')
        assert.equal(AP.resolve.getUrl(asset.input), 'http://mycdn.com/file1.txt?v=1')
        assert.equal(AP.resolve.getPath(asset.input, { cleanup: true }), 'file1.txt')
        assert.equal(AP.resolve.getUrl(asset.input, { cleanup: true }), 'http://mycdn.com/file1.txt')
        assert.equal(AP.resolve.getInputFromOutput(asset.output), 'tmp/test-units/file1.txt')
        assert.equal(AP.resolve.getInputFromOutput(asset.output, true), normalize(join(__dirname, '../tmp/test-units/file1.txt'), "web"))
        assert.deepEqual(AP.resolve.parse('./tmp/test-units/file1.txt'), {
          relative: "tmp/test-units/file1.txt",
          full: normalize(join(__dirname, '../tmp/test-units/file1.txt'), "web"),
          source: "tmp/test-units",
          key: "file1.txt"
        })
      } else {
        assert.equal(AP.resolve.getPath(asset.input), 'file.txt')
        assert.equal(AP.resolve.getUrl(asset.input), 'http://mycdn.com/file.txt')
        assert.equal(AP.resolve.getPath(asset.input, { cleanup: true }), 'file.txt')
        assert.equal(AP.resolve.getUrl(asset.input, { cleanup: true }), 'http://mycdn.com/file.txt')
        assert.equal(AP.resolve.getInputFromOutput(asset.output), 'tmp/test-units/file.txt.ejs')
        assert.equal(AP.resolve.getInputFromOutput(asset.output, true), normalize(join(__dirname, '../tmp/test-units/file.txt.ejs'), "web"))
        assert.deepEqual(AP.resolve.parse('./tmp/test-units/file.txt.ejs'), {
          relative: "tmp/test-units/file.txt.ejs",
          full: normalize(join(__dirname, '../tmp/test-units/file.txt.ejs'), "web"),
          source: "tmp/test-units",
          key: "file.txt.ejs"
        })
      }
    })
  })

  it('Urls', async () => {
    const AP0 = await setup(async (AP0) => {
      AP0.source.add(LOAD_PATH)
        .file
        .add('file1.txt', { output: "#{output.dir}/#{output.name}#{output.ext}?v=1" })
        .add('file.txt.ejs', { output: "#{output.name}" })
    })

    AP0.manifest.export().forEach((asset) => {
      if (asset.input.match(/file1\.txt/)) {
        assert.equal(AP0.resolve.getUrl(asset.input), 'file1.txt?v=1')
        assert.equal(AP0.resolve.getUrl(asset.input, { cleanup: true }), 'file1.txt')
      } else {
        assert.equal(AP0.resolve.getUrl(asset.input), 'file.txt')
        assert.equal(AP0.resolve.getUrl(asset.input, { cleanup: true }), 'file.txt')
      }
    })

    const AP1 = await setup(async (AP1) => {
      AP1.resolve.host = 'http://mycdn.com/'
      AP1.source.add(LOAD_PATH)
        .file
        .add('file1.txt', { output: "#{output.dir}/#{output.name}#{output.ext}?v=1" })
        .add('file.txt.ejs', { output: "#{output.name}" })
    })

    AP1.manifest.export().forEach((asset) => {
      if (asset.input.match(/file1\.txt/)) {
        assert.equal(AP1.resolve.getUrl(asset.input), 'http://mycdn.com/file1.txt?v=1')
        assert.equal(AP1.resolve.getUrl(asset.input, { cleanup: true }), 'http://mycdn.com/file1.txt')
      } else {
        assert.equal(AP1.resolve.getUrl(asset.input), 'http://mycdn.com/file.txt')
        assert.equal(AP1.resolve.getUrl(asset.input, { cleanup: true }), 'http://mycdn.com/file.txt')
      }
    })
  })

  it('Rename', async () => {
    const AP = await setup(async (AP) => {
      const app = AP.source.add(LOAD_PATH)
      app.file.add("sub0/sub1/file7.txt", {
        output: "#{output.name}.md"
      })
      app.file.add("sub0/sub1/file8.txt", {
        output: { ext: ".md", dir: "." }
      })
      app.file.add("sub0/sub1/file9.txt", {
        output(options) {
          return `${options.output.name}.md`
        }
      })
    })

    const assets = AP.manifest.export()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.output), ['file7.md', 'file8.md', 'file9.md'])
  })

  it('Rename (name/ext/base)', async () => {
    const AP = await setup(async (AP) => {
      const app = AP.source.add(LOAD_PATH)
      app.file.add("sub0/sub1/file7.txt", {
        output: { ext: ".log", name: "debug7", dir: "." }
      })
      app.file.add("sub0/sub1/file8.txt", {
        output: { base: "#{output.name}.md", dir: "." }
      })
      app.file.add("sub0/sub1/file9.txt", {
        output: { base: "#{output.name}.md", ext: ".log", name: "debug9", dir: "." }
      })
    })

    const assets = AP.manifest.export()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.output), ['debug7.log', 'file8.md', 'debug9.log'])
  })

})

describe("Directory", () => {

  it("Add directory", async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(join(LOAD_PATH))
        .directory.add('others')
    })
    assert.equal(AP.manifest.has('others'), true)
  })

  it("Add directories", async () => {
    const AP = await setup(async (AP) => {
      AP.source.add(join(LOAD_PATH, 'sub0'))
        .directory.add("**/**")
    })

    const assets = AP.manifest.export()
    assert.equal(assets.length, 4)
    assert.deepEqual(assets.map((asset) => asset.input), ['sub1', 'sub1/file7.txt', 'sub1/file8.txt', 'sub1/file9.txt'])
  })

  it('file_rules[] and couple rules', async () => {
    const AP = await setup(async (AP) => {
      AP.cache.enabled = true
      AP.source.add(LOAD_PATH)
        .directory.add('sub0/sub1', {
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

    const assets = AP.manifest.export()
    assert.equal(assets.length, 3)
    assert.deepEqual(assets.map((asset) => asset.input), ['sub0/sub1', 'sub0/sub1/file8.txt', 'sub0/sub1/file9.txt'])

    const view = []
    view.push('tmp/test-units-dist')
    view.push('  r_sub0')
    view.push('    r_sub1')
    view.push('      file8.txt?2e276386aa7ecf2755fb164b68ffbe0d')
    view.push('  file9-a753a6e8378ee3ee03118da83d861934.txt')

    assert.equal(AP.tree.view(), view.join('\n'));
  })

})

describe('Directory (FS)', () => {

  it("Copy directory", async () => {
    const AP = await setup(async (AP) => {
      const source = AP.source.add(LOAD_PATH)
      source.directory.add("others")
      source.fs.copy("others/**/*") // Need wildcards
    })

    await AP.copy()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/others/file4.txt',
      'tmp/test-units-dist/others/file5.txt',
      'tmp/test-units-dist/others/file6.txt',
    ])
  })

  it("Copy renamed directory", async () => {
    const AP = await setup(async (AP) => {
      const source = AP.source.add(LOAD_PATH)
      source.directory.add("others", { output: "hello" })
      source.fs.copy("others/**/*") // Need wildcards
    })

    await AP.copy()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/hello/file4.txt',
      'tmp/test-units-dist/hello/file5.txt',
      'tmp/test-units-dist/hello/file6.txt',
    ])
  })

  it("Copy and use rename() method", async () => {
    const AP = await setup(async (AP) => {
      const source = AP.source.add(LOAD_PATH)
      source.file.add("others/**/*", {
        output({ input }) {
          return Path.join('world', input.base)
        }
      })
      source.fs.copy("others/**/*") // Need wildcards
    })

    await AP.copy()

    const files = fetch(DST_PATH + '/**/*')
    assert.deepEqual(files, [
      'tmp/test-units-dist/world/file4.txt',
      'tmp/test-units-dist/world/file5.txt',
      'tmp/test-units-dist/world/file6.txt',
    ])
  })

  it("Copy new only", async () => {
    const res = await exec('node test/copy.js', { fetchStdout: true })
    const last = res.stdout.toString('utf-8').trim().split('\n').pop()
    assert.equal(last, '[asset-pipeline] copy lib/index.ts tmp/copy/index.ts')
  })

})

describe('Shadow', () => {

  it('Add shadow files', async () => {
    const AP = await setup(async (AP) => {
      AP.cache.enabled = true
      const source = AP.source.add(LOAD_PATH)
      source.file.add("others/**/*", {
        output: "world/#{output.base}"
      })
      source.fs.copy("others/**/*") // Need wildcards
    })

    AP.source.all()[0].file.shadow('vendor.js', { cache: "common.js" })

    await AP.fetch()

    const assets = AP.manifest.export()
    assert.equal(assets.length, 4)
    assert.deepEqual(AP.manifest.get('vendor.js'), {
      source: {
        uuid: '__shadow__',
        path: '__shadow__',
      },
      input: 'vendor.js',
      output: 'vendor.js',
      cache: 'common.js',
      resolved: true,
      rule: {
        glob: 'vendor.js',
        cache: "common.js"
      },
      tag: 'default'
    })
  })

  it('Add shadow directories', async () => {
    const AP = await setup(async (AP) => {
      AP.cache.enabled = true
      const source = AP.source.add(LOAD_PATH)
      source.file.add("others/**/*", {
        output: "world/#{output.base}"
      })
      source.fs.copy("others/**/*") // Need wildcards
    })

    AP.source.all()[0].directory.shadow('vendors')

    await AP.fetch()

    const assets = AP.manifest.export()
    assert.equal(assets.length, 4)
    assert.deepEqual(AP.manifest.get('vendors'), {
      source: {
        uuid: '__shadow__',
        path: '__shadow__',
      },      input: 'vendors',
      output: 'vendors',
      cache: 'vendors-31f8a1904fd034d5acebbff82304dc52',
      resolved: true,
      rule: {
        cache: "vendors-31f8a1904fd034d5acebbff82304dc52",
        glob: 'vendors'
      },
      tag: 'default'
    })
  })

})