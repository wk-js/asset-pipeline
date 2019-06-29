const { AssetPipeline, AssetFileSystem } = require('../../js')

const p = new AssetPipeline()
p.root_path = __dirname
p.load_paths.add('./app')
p.load_paths.add('./shaders')
p.load_paths.add('./app/texts')
p.cacheable = true

p.directory.add('assets/images', {
  keep_path: false,
  rename: "plouf/yolo",
  file_rules: [
    {
      // ignore: true,
      cache: true,
      rename: "#{dir}/#{name}#{ext}?#{hash}",
    }
  ]
})
p.file.add('assets/**/*', { base_dir: "youhou" })
p.file.add('**/*', {
  cache: false,
  rename: function(output, input, rule) {
    // console.log(output)
    return output
  }
})

// const fs = new AssetFileSystem( p )
// fs.copy('**/*')
p.fs.copy('**/*')

p.resolve(true).then(() => {
  console.log(p.resolver.view())
  p.fs.apply()

  // console.log(p.resolver.getSourceFilePath('assets/hello.txt'));
  // console.log(p.resolver.getSourceFilePath('assets/hello.txt', __dirname));


  // p.manager.process()
  // console.log(p.getPath('hello.txt'))
  // console.log(p.getPath('images/noimage.txt'))
  // console.log(p.getPath('plouf.txt'))
  // console.log(p.manifest.getUsedAssets())
})