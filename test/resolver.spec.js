const { LOAD_PATH, setupWithEntries, DST_PATH } = require("./setup")
const assert = require("assert")
const { Pipeline } = require("../cjs")

describe("Resolver", () => {

  it("Get path", async () => {
    const p = await setupWithEntries()

    assert.strictEqual(p.resolver.getPath("tmp/test-units/app/scripts/main.ts"), "/main.js")

    p.resolver.alias(LOAD_PATH.join("app"))
    assert.strictEqual(p.resolver.getPath("scripts/main.ts"), "/main.js")

    p.resolver.host.set("https://localhost:3000/public/")
    assert.strictEqual(p.resolver.getPath("scripts/main.ts"), "/public/main.js")
  })

  it("Get url", async () => {
    const p = await setupWithEntries()

    p.resolver.alias(LOAD_PATH.join("app"))

    p.resolver.host.set("https://localhost:3000/")
    assert.strictEqual(p.resolver.getUrl("scripts/main.ts"), "https://localhost:3000/main.js")

    p.resolver.host.set("https://localhost:3000/sub-directory/")
    assert.strictEqual(p.resolver.getUrl("scripts/main.ts"), "https://localhost:3000/sub-directory/main.js")
  })

  it("Get output path", async () => {
    const p = await setupWithEntries()
    const dist = DST_PATH.clone()

    p.resolver.alias(LOAD_PATH.join("app"))
    assert.strictEqual(p.resolver.getOutputPath("scripts/main.ts"), dist.join("main.js").unix())

    p.resolver.output.set("dist")
    dist.set("dist")
    assert.strictEqual(p.resolver.getOutputPath("scripts/main.ts"), dist.join("main.js").unix())
  })

  it("Ignore", async () => {
    const p = new Pipeline()
    p.files.include(LOAD_PATH.join("app/assets/**/*"))
    p.files.exclude(LOAD_PATH.join("app/assets/flags.png"), LOAD_PATH.join("app/assets/emoji/emoji1.png"))
    p.fetch()

    assert.deepStrictEqual(p.files.entries, [
      LOAD_PATH.join("app/assets/emoji/emoji0.png").unix(),
      LOAD_PATH.join("app/assets/emoji/emoji2.png").unix(),
    ])
  })

})