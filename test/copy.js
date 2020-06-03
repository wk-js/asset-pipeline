const { AssetPipeline } = require('../js/index')
const { removeDir, editFile } = require('lol/js/node/fs')
const Fs = require('fs')

async function main() {
  const assets = new AssetPipeline()
  assets.resolve.output('./tmp/copy')
  assets.verbose = true

  const lib = assets.source.add('lib')
  lib.file.add('**/*.ts')
  lib.fs.copy('**/*.ts')

  await assets.copy()

  await editFile('lib/index.ts', b => b)

  await assets.copy()

  await removeDir(assets.resolve.output())
}

main()