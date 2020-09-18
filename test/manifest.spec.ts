import "mocha";
import * as assert from "assert";
import { manifestGetAsset, manifestGetAssetWithSource, setupWithSourcesAdded } from "./setup"
import { join } from "path";

describe("Manifest", () => {

  it("Get asset", async () => {
    const p = await setupWithSourcesAdded()

    const asset = p.manifest.getAsset("main.ts")!
    assert.equal(!!asset, true)

    const source = p.source.get(asset.source.uuid)!
    assert.equal(!!source, true)

    assert.equal(source.path.join(asset.input).web(), "app/scripts/main.ts")
    assert.equal(source.fullpath.join(asset.input).os(), join(p.cwd.web(), "app/scripts/main.ts"))
  })

  it("Get asset with source", async () => {
    const p = await setupWithSourcesAdded()

    const asset = p.manifest.getAssetWithSource("main.ts")!
    assert.equal(!!asset, true)

    assert.equal(asset.source.path.join(asset.input).web(), "app/scripts/main.ts")
    assert.equal(asset.source.fullpath.join(asset.input).os(), join(p.cwd.web(), "app/scripts/main.ts"))
  })

  it("Get asset (shadow)", async () => {
    const p = await setupWithSourcesAdded()
    assert.deepEqual(p.manifest.getAsset("main.css"), {
      cache: "main.css",
      input: "main.css",
      output: "main.css",
      rule: {
        glob: 'main.css',
        output: 'main.css',
      },
      source: {
        path: '__shadow__',
        uuid: '__shadow__',
      },
      resolved: true,
      tag: 'default',
      type: "file",
    })
    assert.equal(!!p.manifest.getAssetWithSource("main.css"), true)
  })

})