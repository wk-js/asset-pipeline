# asset-pipeline

```js
const { AssetPipeline } = require('asset-pipeline')
const pipeline = new AssetPipeline()

// Set the root path
pipeline.root_path = process.cwd() + '/app'

// Enable cache-break
pipeline.cacheable = false

// Set cache type between hash|version
pipeline.cache_type = 'hash'

// Force asset-pipeline to resolve at each .resolve() call
pipeline.force_resolve = false

// Set host
pipeline.asset_host = 'http://mycdn.com'

// Register file
pipeline.addFile('views/page.html', {
  // Remove directory path
  keep_path: false,

  // Rename output path
  rename: 'index.html',

  // Enable cache-break
  cache: false,

  // Change base directory
  base_dir: '.',

  // Instead of using options, you can override the output path
  resolve: function(output, file, rules) {
    return output
  }
})

// Register multiple files
pipeline.addFile('scripts/vendors/**/*.js')

// Register a directory
pipeline.addDirectory('assets', {
  rename: 'resources'
})

// Resolve assets
pipeline.resolve().then(() => {
  console.log(pipeline.manifest.manifest)

  // Register every files inside assets and copy them into resources as precised in the previous rule
  pipeline.manager.copy('assets/**/*')

  // Execute copy/move/symlinks
  pipeline.manager.process()
})
```

# TODO

* Add test units
* Remove alternatives
* Remove data object
* Review cache types