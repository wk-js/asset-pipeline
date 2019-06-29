# asset-pipeline

Handle your assets like a boss

## Features

* Multiple load paths
* Cache-break
* Get a manifest file
* Prefix with your CDN url
* Customize your rename rule
* Handle move/copy/symlink

## Example

* [Test units](./test/test.spec.ts)
* [Quick tests](./test/_old/test.js)

```js
const { AssetPipeline } = require('asset-pipeline')
const pipeline = new AssetPipeline()

// Add multiple source path
pipeline.load_paths.add('./app')

// Add multiple source path
pipeline.dst_path = './public'

// Set the root path
pipeline.root_path = process.cwd()

// Enable cache-break
pipeline.cacheable = false

// Set cache type between hash|version
pipeline.cache_type = 'hash'

// Hash key for cache-break and manifest file name
pipeline.hash_key = Math.random()

// Force asset-pipeline to resolve at each .resolve() call
pipeline.manifest.read = false

// Save manifest file
pipeline.manifest.save = true

// Set host
pipeline.host = 'http://mycdn.com'

// Register file
pipeline.file.add('views/page.html', {
  // Ignore these files
  ignore: false,

  // Enable cache-break
  cache: false,
  // Instead of using options, you can override the output path
  rename: function(output, file, rules) {
    return 'index.html'
  },

  // Remove directory path
  keep_path: false,

  // Change base directory
  base_dir: '.',
})

// Register multiple files
pipeline.file.add('scripts/vendors/**/*.js', {
  // Rename output path
  rename: '${name}${ext}?${hash}',
})

// Register a directory
pipeline.directory.add('assets', {
  rename: 'resources'
})

// Register every files inside assets and copy them into resources as precised in the previous rule
pipeline.fs.copy('assets/**/*')


// Resolve assets
pipeline.resolve().then(() => {
  console.log(pipeline.manifest.manifest)
  console.log(pipeline.resolver.view())
  console.log(pipeline.resolver.getPath('views/page.html')) // index.html
  console.log(pipeline.resolver.getUrl('views/page.html')) // http://mycdn.com/index.html
  console.log(pipeline.resolver.getFilePath('views/page.html')) // Without extra #|?
  console.log(pipeline.resolver.getFileUrl('views/page.html')) // Without extra #|?
  console.log(pipeline.resolver.getSourceFilePath('views/page.html')) // 'app/views/page.html'

  // Execute copy/move/symlinks
  pipeline.fs.apply()
})
```

# TODO

* Add test units
* Remove alternatives
* Remove data object
* Review cache types