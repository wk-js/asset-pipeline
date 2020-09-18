import "mocha";
import * as assert from "assert";
import { getAsset, getAssetFromOutput, setupWithSourcesAdded, setup } from "./setup"

describe("Files", () => {

  it("Get path/url/asset/assetFromOutput", async () => {
    const p = await setupWithSourcesAdded()
    assert.equal(p.getPath("main.ts"), "/main.js")
    assert.equal(p.getUrl("main.ts"), "/main.js")
    assert.deepEqual(getAsset("main.ts", p), {
      cache: "main.js",
      input: "main.ts",
      output: "main.js",
      rule: {
        glob: 'main.ts',
        output: 'main.js'
      },
      source: {
        path: 'app/scripts',
      },
      resolved: true,
      tag: 'default',
      type: "file",
    })
    assert.deepEqual(getAssetFromOutput("main.js", p), {
      cache: "main.js",
      input: "main.ts",
      output: "main.js",
      rule: {
        glob: 'main.ts',
        output: 'main.js'
      },
      source: {
        path: 'app/scripts',
      },
      resolved: true,
      tag: 'default',
      type: "file",
    })
  })

  it("Ignored", async () => {
    const p = await setupWithSourcesAdded()
    assert.equal(p.getPath("_layout.html.ejs"), "/_layout.html.ejs")
    assert.equal(p.getUrl("_layout.html.ejs"), "/_layout.html.ejs")
    assert.equal(p.manifest.getAsset("_layout.html.ejs"), null)
    assert.equal(p.manifest.findAssetFromOutput("layout.html"), null)
  })

  it("baseDir", async () => {
    const p = await setup(async p => {
      const scripts = p.source.add("app/scripts")
      scripts.file.add("main.ts", {
        baseDir: "MyBaseDir"
      })
    })

    assert.equal(p.getUrl("main.ts"), "/MyBaseDir/main.ts")
  })

  it("keepPath", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.file.add("scripts/main.ts", {
        keepPath: false
      })
    })

    assert.equal(p.getUrl("scripts/main.ts"), "/main.ts")
  })

  it("Host", async () => {
    const p = await setupWithSourcesAdded(async p => {
      p.host.setURL("http://mycdn.com/")
    })
    assert.equal(p.getPath("main.ts"), "/main.js")
    assert.equal(p.getUrl("main.ts"), "http://mycdn.com/main.js")
    assert.deepEqual(getAsset("main.ts", p), {
      cache: "main.js",
      input: "main.ts",
      output: "main.js",
      rule: {
        glob: 'main.ts',
        output: 'main.js'
      },
      source: {
        path: 'app/scripts',
      },
      resolved: true,
      tag: 'default',
      type: "file",
    })
    assert.deepEqual(getAssetFromOutput("main.js", p), {
      cache: "main.js",
      input: "main.ts",
      output: "main.js",
      rule: {
        glob: 'main.ts',
        output: 'main.js'
      },
      source: {
        path: 'app/scripts',
      },
      resolved: true,
      tag: 'default',
      type: "file",
    })
  })

  it("Shadow", async () => {
    const p = await setupWithSourcesAdded(async p => {
      p.host.setURL("http://mycdn.com/")
    })

    assert.equal(p.getPath("main.css"), "/main.css")
    assert.equal(p.getUrl("main.css"), "http://mycdn.com/main.css")
    assert.deepEqual(p.manifest.getAsset("main.css"), {
      cache: "main.css",
      input: "main.css",
      output: "main.css",
      rule: {
        glob: 'main.css',
        output: 'main.css',
      },
      source: {
        path: '__shadow__',
        uuid: '__shadow__'
      },
      resolved: true,
      tag: 'default',
      type: "file",
    })
    assert.deepEqual(p.manifest.findAssetFromOutput("main.css"), {
      cache: "main.css",
      input: "main.css",
      output: "main.css",
      rule: {
        glob: 'main.css',
        output: 'main.css',
      },
      source: {
        path: '__shadow__',
        uuid: '__shadow__'
      },
      resolved: true,
      tag: 'default',
      type: "file",
    })
  })

})