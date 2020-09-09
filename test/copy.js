const { AssetPipeline } = require('../js/index')
const { removeDir, editFile } = require('lol/js/node/fs')

async function main() {
  const assets = new AssetPipeline()
  assets.output.set('./tmp/copy')
  assets.verbose = true
  assets.manifest.saveOnDisk = false

  const lib = assets.source.add('lib')
  lib.file.add('**/*.ts')
  lib.fs.copy('**/*.ts')

  assets.fetch(true)

  await assets.copy()

  await editFile('lib/index.ts', b => b)

  await assets.copy()

  await removeDir(assets.output.os())
}

main()