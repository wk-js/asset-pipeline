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
          path: "/main-99ac3f9932ab062fcc6d004092a8c770.css",
          url: "/main-99ac3f9932ab062fcc6d004092a8c770.css",
        },
        type: "file",
      },
      {
        input: "main.ts",
        output: {
          path: "/main-15bd94418e42cef2feb6c03367128b8f.js",
          url: "/main-15bd94418e42cef2feb6c03367128b8f.js",
        },
        type: "file",
      },
      {
        input: "common.styl",
        output: {
          path: "/common-bc4bed16f8370d5d339cb9570fad5d16.css",
          url: "/common-bc4bed16f8370d5d339cb9570fad5d16.css",
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