import "mocha";
import * as assert from "assert";
import { DST_PATH, LOAD_PATH, setupWithSourcesAdded, setup } from "./setup";
import { join } from "path";
import { normalize } from "../lib/path";

describe("Resolver", () => {

  it("View", async () => {
    const p = await setupWithSourcesAdded(async p => {
      const assets = p.source.add("app/assets")
      assets.file.add("**/*", { baseDir: "assets" })
    })

    let output = normalize(join(process.cwd(), join(LOAD_PATH, DST_PATH)), "web")
    output += "\n"
    output += "  assets\n"
    output += "    emoji\n"
    output += "      emoji0.png\n"
    output += "      emoji1.png\n"
    output += "      emoji2.png\n"
    output += "    flags.png\n"
    output += "  main.css\n"
    output += "  main.js\n"
    output += "  common.css\n"
    output += "  index.html"

    assert.equal(p.resolver.view().trim(), output.trim())
  })

  it("Rule order (file)", async () => {
    const p = await setup(async p => {
      const assets = p.source.add("app/assets")
      assets.file.add("emoji/**/*", {
        tag: "asset",
        output: { dir: "." }
      })
      assets.file.add("**/*", {
        tag: "asset",
        baseDir: "assets"
      })
    })

    let output = normalize(join(process.cwd(), join(LOAD_PATH, DST_PATH)), "web")
    output += "\n"
    output += "  assets\n"
    output += "    flags.png\n"
    output += "  emoji0.png\n"
    output += "  emoji1.png\n"
    output += "  emoji2.png\n"

    assert.equal(p.resolver.view().trim(), output.trim())
  })

  it("Rule order (directory)", async () => {
    const p = await setup(async p => {
      const assets = p.source.add("app/assets")
      assets.directory.add("emoji", {
        tag: "asset",
        fileRules: [
          { glob: "**/*", output: { dir: "." } }
        ]
      })
      assets.file.add("**/*", {
        tag: "asset",
        baseDir: "assets"
      })
    })

    let output = normalize(join(process.cwd(), join(LOAD_PATH, DST_PATH)), "web")
    output += "\n"
    output += "  emoji\n"
    output += "  assets\n"
    output += "    flags.png\n"
    output += "  emoji0.png\n"
    output += "  emoji1.png\n"
    output += "  emoji2.png\n"

    assert.equal(p.resolver.view().trim(), output.trim())
  })

})