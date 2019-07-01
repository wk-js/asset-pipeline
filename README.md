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
pipeline.source.add('./app')

// Add multiple source path
pipeline.resolve.output = './public'

// Set the root path
pipeline.resolve.root = process.cwd()

// Enable cache-break
pipeline.cache.enabled = false

// Set cache type between hash|version
pipeline.cache.type = 'hash'

// Hash key for cache-break and manifest file name
pipeline.cache.key = Math.random()

// Force asset-pipeline to resolve at each .resolve() call
pipeline.manifest.read = false

// Save manifest file
pipeline.manifest.save = true

// Set host
pipeline.resolve.host = 'http://mycdn.com'

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
  rename: 'vendors/${name}${ext}?${hash}',
})

// Register a directory
pipeline.directory.add('assets', {
  rename: 'resources',

  // Apply rules to files or subdirectories, you can only cache, rename, ignore
  file_rules: [
    {
      glob: "**/*.jpg",
      cache: true
    }
  ]
})

// Register every files inside assets and copy them into resources as precised in the previous rule
pipeline.fs.copy('assets/**/*')

// Resolve assets
pipeline.fetch().then(() => {
  console.log(pipeline.manifest.file)
  console.log(pipeline.resolve.view())
  console.log(pipeline.resolve.path('scripts/vendors/index.js')) // vendors/index.js?41cf53f6d96624fb40dc4f2780b89bf0
  console.log(pipeline.resolve.url('scripts/vendors/index.js')) // http://mycdn.com/vendors/index.js?41cf53f6d96624fb40dc4f2780b89bf0
  console.log(pipeline.resolve.clean_path('scripts/vendors/index.js')) // vendors/index.js
  console.log(pipeline.resolve.clean_url('scripts/vendors/index.js')) // http://mycdn.com/vendors/index.js

  const asset = pipeline.resolve.asset('scripts/vendors/index.js')
  console.log(pipeline.resolve.source(asset.output)) // 'scripts/vendors/index.js'
  console.log(pipeline.resolve.source(asset.output, true)) // '/User/someone/Documents/sample/scripts/vendors/index.js'

  // Execute copy/move/symlinks
  pipeline.fs.apply()
})
```