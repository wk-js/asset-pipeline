const { LOAD_PATH } = require("./setup")
const assert = require("assert")
const { Pipeline, PathBuilder } = require("../cjs")

describe("Rules", () => {

  it("name", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    const transform = p.rules.add(file).name("bundle").apply(file.unix())
    assert.strictEqual(transform.path, LOAD_PATH.join("app/scripts/bundle.ts").web())
  })

  it("extension", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    const transform = p.rules.add(file).extension(".js").apply(file.unix())
    assert.strictEqual(transform.path, LOAD_PATH.join("app/scripts/main.js").web())
  })

  it("name + extension", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    const transform = p.rules.add(file).name("bundle").extension(".js").apply(file.unix())
    assert.strictEqual(transform.path, LOAD_PATH.join("app/scripts/bundle.js").web())
  })

  it("directory", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    const transform = p.rules.add(file).directory("js").apply(file.unix())
    assert.strictEqual(transform.path, new PathBuilder("js/main.ts").web())
  })

  it("baseDirectory", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    const transform = p.rules.add(file).baseDirectory("base").apply(file.unix())
    assert.strictEqual(transform.path, new PathBuilder("base").join(LOAD_PATH.join("app/scripts/main.ts").unix()).web())
  })

  it("directory + baseDirectory", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    const transform = p.rules.add(file).baseDirectory("base").directory("js").apply(file.unix())
    assert.strictEqual(transform.path, new PathBuilder("base/js/main.ts").web())
  })

  it("keepDirectory", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    const transform = p.rules.add(file).keepDirectory(false).apply(file.unix())
    assert.strictEqual(transform.path, new PathBuilder("main.ts").web())
  })

  it("cachebreak", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")

    {
      p.rules.items = []
      p.rules.cachebreak = true
      const transform = p.rules.add(file).cachebreak(false).apply(file.unix(), p.rules)
      assert.strictEqual(transform.path, file.web())
    }

    {
      p.rules.items = []
      p.rules.cachebreak = true
      const transform = p.rules.add(file).cachebreak(true).apply(file.unix(), p.rules)
      assert.strictEqual(transform.path, LOAD_PATH.join("app/scripts/main-828b646f86600bc8d37da6a0d8a78eb3.ts").web())
    }

    {
      p.rules.items = []
      p.rules.cachebreak = false
      const transform = p.rules.add(file).cachebreak(true).apply(file.unix(), p.rules)
      assert.strictEqual(transform.path, file.web())
    }

    {
      p.rules.items = []
      p.rules.cachebreak = true
      p.rules.saltKey = "hola"
      const transform = p.rules.add(file).cachebreak(true).apply(file.unix(), p.rules)
      assert.strictEqual(transform.path, LOAD_PATH.join("app/scripts/main-f29f2cc55986511037de9639225a39f3.ts").web())
    }
  })

  it("priority", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    p.files.include(file)
    p.rules.add(file).extension(".js").name("bundle").priority(1)
    p.rules.add(file).extension(".js").priority(0)
    p.fetch()

    assert.strictEqual(p.resolver.getPath(file.unix()), "/" + LOAD_PATH.join("app/scripts/bundle.js").web())
  })

  it("priority order", async () => {
    const p = new Pipeline()
    const file = LOAD_PATH.join("app/scripts/main.ts")
    p.files.include(file)
    p.rules.add(file).extension(".js").priority(0)
    p.rules.add(file).extension(".js").name("bundle").priority(0)
    p.fetch()

    assert.strictEqual(p.resolver.getPath(file.unix()), "/" + LOAD_PATH.join("app/scripts/bundle.js").web())
  })

})