import "mocha";
import * as assert from "assert";
import { setup } from "./setup"

describe("Multiple sources", () => {

  it("Output", async () => {
    const p = await setup(async p => {
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
    })

    assert.deepEqual(p.manifest.export("output"), [
      {
        input: "main.css",
        output: {
          path: "/main.css",
          url: "/main.css",
        },
        type: "file",
      },
      {
        input: "main.ts",
        output: {
          path: "/main.js",
          url: "/main.js",
        },
        type: "file",
      },
      {
        input: "common.styl",
        output: {
          path: "/common.css",
          url: "/common.css",
        },
        type: "file",
      },
      {
        input: "index.html.ejs",
        output: {
          path: "/index.html",
          url: "/index.html",
        },
        type: "file",
      },
    ], "Manifest is invalid")
  })

  it("Cache", async () => {
    const p = await setup(async p => {
      p.cache.enabled = true

      const scripts = p.source.add("app/scripts")
      scripts.file.add("main.ts", {
        output: { ext: ".js" },
        cache: { ext: ".mjs" },
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
    })

    assert.deepEqual(p.manifest.export("output"), [
      {
        input: "main.css",
        output: {
          path: "/main-704b46a5c231868ba790744e636bd4d5.css",
          url: "/main-704b46a5c231868ba790744e636bd4d5.css",
        },
        type: "file",
      },
      {
        input: "main.ts",
        output: {
          path: "/main-31d1228c5030cba693fb22ac68536f01.mjs",
          url: "/main-31d1228c5030cba693fb22ac68536f01.mjs",
        },
        type: "file",
      },
      {
        input: "common.styl",
        output: {
          path: "/common-f7eaf4be083c38605b6ad1cdb7b4b11a.css",
          url: "/common-f7eaf4be083c38605b6ad1cdb7b4b11a.css",
        },
        type: "file",
      },
      {
        input: "index.html.ejs",
        output: {
          path: "/index.html",
          url: "/index.html",
        },
        type: "file",
      },
    ], "Manifest is invalid")
  })

})