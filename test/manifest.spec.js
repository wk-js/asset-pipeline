const assert = require("assert")
const { writeFileSync } = require("lol/js/node/fs")
const { Pipeline, ManifestPlugin } = require("../cjs")
const { LOAD_PATH } = require("./setup")

describe("manifest", () => {

  it("save", async () => {
    const p = new Pipeline()
    await p.plugin(ManifestPlugin)

    p.files.include("tmp/test-units/app/scripts/main.ts")
    p.rules.add("tmp/test-units/app/scripts/main.ts").keepDirectory(false).extension(".js")
    p.fetch()

    const manifest = p.options("manifest")
    assert.deepStrictEqual(manifest.file, {
      "saltKey": "",
      "date": manifest.file.date,
      "aliases": [],
      "entries": [
        [
          "tmp/test-units/app/scripts/main.ts",
          {
            "path": "main.js",
            "tag": "default",
            "priority": 0
          }
        ]
      ]
    })
  })

  it("set", async () => {
    const p = new Pipeline()
    await p.plugin(ManifestPlugin)

    const manifest = p.options("manifest")
    manifest.set({
      "saltKey": "",
      "date": "2021-02-04T18:43:26.338Z",
      "aliases": [
        "tmp/test-units/app"
      ],
      "entries": [
        [
          "tmp/test-units/app/scripts/main.ts",
          {
            "path": "main.js",
            "tag": "default",
            "priority": 0
          }
        ]
      ]
    })

    assert.strictEqual(p.resolver.getPath("scripts/main.ts"), "/main.js")
  })

  it("read", async () => {
    const p = new Pipeline()
    await p.plugin(ManifestPlugin)

    const manifest = p.options("manifest")
    manifest.path = LOAD_PATH.join("manifest.json")

    writeFileSync(manifest.path.unix(), JSON.stringify({
      "saltKey": "",
      "date": "2021-02-04T18:43:26.338Z",
      "aliases": [
        "tmp/test-units/app"
      ],
      "entries": [
        [
          "tmp/test-units/app/scripts/main.ts",
          {
            "path": "main.js",
            "tag": "default",
            "priority": 0
          }
        ]
      ]
    }))

    manifest.read()
    assert.strictEqual(p.resolver.getPath("scripts/main.ts"), "/main.js")
  })

})