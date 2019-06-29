const { AssetPipeline } = require('../../js/asset-pipeline')

const p = new AssetPipeline()
p.root_path = __dirname
p.cache_type = 'version'
// p.load_path = 'assets1'
p.load_paths.add('./assets0')
p.load_paths.add('./assets1')
p.cacheable = true

p.addFile('**/*', { base_dir: 'assets' })

p.manager.copy('**/*')

p.resolve(true).then(() => {
  console.log(p.tree.view())
  p.manager.process()
  // console.log(p.getPath('hello.txt'))
  // console.log(p.getPath('images/noimage.txt'))
  // console.log(p.getPath('plouf.txt'))
  // console.log(p.manifest.getUsedAssets())
})