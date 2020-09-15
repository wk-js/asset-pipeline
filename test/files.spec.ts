import "mocha";
import * as assert from "assert";
import { getAsset, getAssetFromOutput, setup, setupWithSourcesAdded } from "./setup"

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
      tag: 'default'
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
      tag: 'default'
    })
  })

  it("Ignored", async () => {
    const p = await setupWithSourcesAdded()
    assert.equal(p.getPath("_layout.html.ejs"), "/_layout.html.ejs")
    assert.equal(p.getUrl("_layout.html.ejs"), "/_layout.html.ejs")
    assert.equal(p.getAsset("_layout.html.ejs"), null)
    assert.equal(p.getAssetFromOutput("layout.html"), null)
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
      tag: 'default'
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
      tag: 'default'
    })
  })

})