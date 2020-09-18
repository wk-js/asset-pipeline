import "mocha";
import * as assert from "assert";
import { DST_PATH, LOAD_PATH, setup } from "./setup";
import { join } from "path";
import { fetch, touch } from "lol/js/node/fs";
import { normalize } from "../lib/path";

describe("FS", () => {

  it("Copy", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets")
      app.fs.copy("assets/**/*")
    })

    await p.copy()

    const files = fetch(join(DST_PATH, "**/*"))
    assert.deepEqual(files, [
      normalize(join(DST_PATH, "assets/emoji/emoji0.png"), "web"),
      normalize(join(DST_PATH, "assets/emoji/emoji1.png"), "web"),
      normalize(join(DST_PATH, "assets/emoji/emoji2.png"), "web"),
      normalize(join(DST_PATH, "assets/flags.png"), "web"),
    ])
  })

  it("Copy renamed directory", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        output: { base: "static" }
      })
      app.fs.copy("assets/**/*")
    })

    await p.copy()

    const files = fetch(join(DST_PATH, "**/*"))
    assert.deepEqual(files, [
      normalize(join(DST_PATH, "static/emoji/emoji0.png"), "web"),
      normalize(join(DST_PATH, "static/emoji/emoji1.png"), "web"),
      normalize(join(DST_PATH, "static/emoji/emoji2.png"), "web"),
      normalize(join(DST_PATH, "static/flags.png"), "web"),
    ])
  })

  it("Copy new only", async () => {
    let count = 0
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        output: { base: "static" }
      })
      app.fs.copy("assets/**/*")
      app.fs.onNewFilesCopied.on((ios) => {
        count = ios!.length
      })
    })

    await p.copy()
    assert.deepEqual(count, 4)

    touch(join(LOAD_PATH, "app/assets/flags.png"))

    await p.copy()
    assert.deepEqual(count, 1)
  })

  it("Move", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets")
      app.fs.move("assets/**/*")
    })

    await p.copy()

    const files = fetch(join(DST_PATH, "**/*"))
    assert.deepEqual(files, [
      normalize(join(DST_PATH, "assets/emoji/emoji0.png"), "web"),
      normalize(join(DST_PATH, "assets/emoji/emoji1.png"), "web"),
      normalize(join(DST_PATH, "assets/emoji/emoji2.png"), "web"),
      normalize(join(DST_PATH, "assets/flags.png"), "web"),
    ])
  })

  it("Move renamed directory", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        output: { base: "static" }
      })
      app.fs.move("assets/**/*")
    })

    await p.copy()

    const files = fetch(join(DST_PATH, "**/*"))
    assert.deepEqual(files, [
      normalize(join(DST_PATH, "static/emoji/emoji0.png"), "web"),
      normalize(join(DST_PATH, "static/emoji/emoji1.png"), "web"),
      normalize(join(DST_PATH, "static/emoji/emoji2.png"), "web"),
      normalize(join(DST_PATH, "static/flags.png"), "web"),
    ])
  })

  it("Move new only", async () => {
    let count = 0
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        output: { base: "static" }
      })
      app.fs.move("assets/**/*")
      app.fs.onNewFilesCopied.on((ios) => {
        count = ios!.length
      })
    })

    await p.copy()
    assert.deepEqual(count, 4)

    touch(join(LOAD_PATH, "app/assets/flags.png"))

    await p.copy()
    assert.deepEqual(count, 1)
  })

  it("Symlink", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets")
      app.fs.symlink("assets")
    })

    await p.copy()

    const files = fetch(join(DST_PATH, "**/*"))
    assert.deepEqual(files, [
      normalize(join(DST_PATH, "assets/emoji/emoji0.png"), "web"),
      normalize(join(DST_PATH, "assets/emoji/emoji1.png"), "web"),
      normalize(join(DST_PATH, "assets/emoji/emoji2.png"), "web"),
      normalize(join(DST_PATH, "assets/flags.png"), "web"),
    ])
  })

  it("Symlink renamed directory", async () => {
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        output: { base: "static" }
      })
      app.fs.symlink("assets")
    })

    await p.copy()

    const files = fetch(join(DST_PATH, "**/*"))
    assert.deepEqual(files, [
      normalize(join(DST_PATH, "static/emoji/emoji0.png"), "web"),
      normalize(join(DST_PATH, "static/emoji/emoji1.png"), "web"),
      normalize(join(DST_PATH, "static/emoji/emoji2.png"), "web"),
      normalize(join(DST_PATH, "static/flags.png"), "web"),
    ])
  })

  it("Symlink new only", async () => {
    let count = 0
    const p = await setup(async p => {
      const app = p.source.add("app")
      app.directory.add("assets", {
        output: { base: "static" }
      })
      app.fs.symlink("assets")
      app.fs.onNewFilesCopied.on((ios) => {
        count = ios!.length
      })
    })

    await p.copy()
    assert.deepEqual(count, 1)

    touch(join(LOAD_PATH, "app/assets/flags.png"))

    await p.copy()
    assert.deepEqual(count, 1)
  })

})