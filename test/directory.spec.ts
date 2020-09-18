import "mocha";
import * as assert from "assert";
import { DST_PATH, setup } from "./setup";
import { writeFileSync } from "lol/js/node/fs";
import { join } from "path";

describe("Directory", () => {

  it("Add directory", async () => {
    const p = await setup(async p => {
      p.source.add("app")
        .directory.add("assets")
    })

    assert.equal(p.manifest.hasAsset("assets"), true)
    assert.equal(p.manifest.hasAsset("assets/emoji/emoji0.png"), true)
    assert.equal(p.manifest.hasAsset("assets/emoji/emoji1.png"), true)
    assert.equal(p.manifest.hasAsset("assets/emoji/emoji2.png"), true)
    assert.equal(p.manifest.hasAsset("assets/flags.png"), true)
  })

  // it("Add directory (shadow)", async () => {
  //   const p = await setup(async p => {
  //     p.source.add("app")
  //       .directory.shadow("static")
  //   })

  //   assert.equal(p.manifest.hasAsset("static"), true)
  // })

  // it.only("Add directory (shadow)", async () => {
  //   const p = await setup(async p => {
  //     writeFileSync("", join(DST_PATH, "static/hola0.png"))
  //     writeFileSync("", join(DST_PATH, "static/hola1.png"))
  //     writeFileSync("", join(DST_PATH, "static/hola2.png"))

  //     p.source.add("app")
  //       .directory.shadow("static")
  //   })

  //   assert.equal(p.manifest.hasAsset("static"), true)
  //   assert.equal(p.manifest.hasAsset("static/hola0.png"), true)
  //   assert.equal(p.manifest.hasAsset("static/hola1.png"), true)
  //   assert.equal(p.manifest.hasAsset("static/hola2.png"), true)
  // })

  it("Ignore directory", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets")
      app.directory.ignore("assets/emoji")
    })

    assert.equal(p.manifest.hasAsset("assets"), true, `"assets" is missing`)
    assert.equal(p.manifest.hasAsset("assets/emoji/emoji0.png"), false, `"assets/emoji/emoji0.png" is not ignored`)
    assert.equal(p.manifest.hasAsset("assets/emoji/emoji1.png"), false, `"assets/emoji/emoji1.png" is not ignored`)
    assert.equal(p.manifest.hasAsset("assets/emoji/emoji2.png"), false, `"assets/emoji/emoji2.png" is not ignored`)
    assert.equal(p.manifest.hasAsset("assets/flags.png"), true, `"assets/flags.png" is ignored`)
  })

  it("baseDir", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        baseDir: "MyBaseDir"
      })
    })

    assert.equal(p.getUrl("assets"), "/MyBaseDir/assets")
  })

  it("keepPath", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        keepPath: false
      })
    })

    assert.equal(p.getUrl("assets"), "/")
  })

  it("Add fileRules", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        fileRules: [
          {
            glob: "assets/emoji/**/*",
            output: { dir: "icons" }
          },
          {
            glob: "assets/flags.png",
            output: { dir: "flags", name: "icons" }
          }
        ]
      })
    })

    assert.equal(p.getUrl("assets/emoji/emoji0.png"), "/icons/emoji0.png")
    assert.equal(p.getUrl("assets/emoji/emoji1.png"), "/icons/emoji1.png")
    assert.equal(p.getUrl("assets/emoji/emoji2.png"), "/icons/emoji2.png")
    assert.equal(p.getUrl("assets/flags.png"), "/flags/icons.png")
  })

})