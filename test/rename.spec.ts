import "mocha";
import * as assert from "assert";
import { setup } from "./setup"

describe("Rename", () => {

  it("Object", async () => {
    const p = await setup(async p => {
      p.source.add("app/scripts")
        .file.add("main.ts", {
          output: { dir: "js", ext: ".js" }
        })
    })

    assert.equal(p.getUrl("main.ts"), "/js/main.js")
  })

  it("Template", async () => {
    const p = await setup(async p => {
      p.source.add("app/scripts")
        .file.add("main.ts", {
          output: "js/#{output.name}.js"
        })
    })

    assert.equal(p.getUrl("main.ts"), "/js/main.js")
  })

  it("Function", async () => {
    const p = await setup(async p => {
      p.source.add("app/scripts")
        .file.add("main.ts", {
          output({ output }) {
            return `js/${output.name}.js`
          }
        })
    })

    assert.equal(p.getUrl("main.ts"), "/js/main.js")
  })

  it("Cache", async () => {
    const p = await setup(async p => {
      p.cache.enabled = true
      p.source.add("app/scripts")
        .file.add("main.ts", {
          output: "js/#{output.name}.js",
          cache: "js/#{output.name}-cache.js",
        })
    })

    assert.equal(p.getUrl("main.ts"), "/js/main-cache.js")
  })

  it("Cache update output", async () => {
    const p = await setup(async p => {
      p.cache.enabled = true
      p.source.add("app/scripts")
        .file.add("main.ts", {
          output: "js/#{output.name}.js",
        })
    })

    assert.equal(p.getUrl("main.ts"), "/js/main-31d1228c5030cba693fb22ac68536f01.js")
  })

  it("Cache inherit output", async () => {
    const p = await setup(async p => {
      p.cache.enabled = true
      p.source.add("app/scripts")
        .file.add("main.ts", {
          output: "js/index.js",
          cache: "js/#{output.name}.js",
        })
    })

    assert.equal(p.getUrl("main.ts"), "/js/index.js")
  })

})