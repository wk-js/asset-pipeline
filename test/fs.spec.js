const assert = require("assert")
const { fetch } = require("lol/js/node/fs")
const { Pipeline, FsPlugin } = require("../cjs")
const { LOAD_PATH, DST_PATH, setupWithEntries } = require("./setup")

describe("fs", () => {

  it("copy", async () => {
    const p = await setupWithEntries()

    await p.plugin(FsPlugin)
    const fs = p.options("fs")
    fs.copy(LOAD_PATH.join("app/assets/**/*").unix())
    await fs.apply()

    const files = fetch(p.resolver.output.join("**/*").unix())
    assert.deepEqual(files, [
      DST_PATH.join("assets/emoji/emoji0.png").web(),
      DST_PATH.join("assets/emoji/emoji1.png").web(),
      DST_PATH.join("assets/emoji/emoji2.png").web(),
      DST_PATH.join("assets/flags.png").web(),
    ])
  })

  it("copy rename", async () => {
    const p = await setupWithEntries(async p => {
      p.rules
        .add(LOAD_PATH.join("app/assets/**/*"))
        .relative(LOAD_PATH.join("app/assets").unix())
        .baseDirectory("static")
        .priority(1)
    })

    await p.plugin(FsPlugin)
    const fs = p.options("fs")
    fs.copy(LOAD_PATH.join("app/assets/**/*").unix())
    await fs.apply()

    const files = fetch(p.resolver.output.join("**/*").unix())
    assert.deepEqual(files, [
      DST_PATH.join("static/emoji/emoji0.png").web(),
      DST_PATH.join("static/emoji/emoji1.png").web(),
      DST_PATH.join("static/emoji/emoji2.png").web(),
      DST_PATH.join("static/flags.png").web(),
    ])
  })

})