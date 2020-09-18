# asset-pipeline <!-- omit in toc -->

Handle your assets like a boss

- [Example](#example)
- [Documentation](#documentation)
  - [Pipeline](#pipeline)
  - [Cache](#cache)
  - [Manifest](#manifest)
  - [Resolver](#resolver)
  - [Source](#source)
  - [File pipeline](#file-pipeline)
  - [Directory pipeline](#directory-pipeline)
  - [Shadow pipeline](#shadow-pipeline)
  - [File System](#file-system)
- [More examples](#more-examples)

## Example

```ts
import { AssetPipeline } from "asset-pipeline";

const hashKey = "anything"
const pipeline = new AssetPipeline(hashKey)

// Set pathname
pipeline.output.setPath("public")

// Set origin
pipeline.output.setOrigin("http://mycdn.com")

// Save on disk at each change (default: false)
pipeline.manifest.saveAtChange = false

// Save on disk (default: true)
pipeline.manifest.saveOnDisk = true

// Read on disk (default: false)
pipeline.manifest.readOnDisk = false

// Create a source object a path relative to cwd
const scripts = pipeline.source.add("app/scripts")

// Register a single file
scripts.file.add("main.ts", {
  // Change the extname at output
  output: { ext: ".js" },

  // Set custom tag for filtering
  tag: "entry:js",
})

// Create as many source as you want
const views = pipeline.source.add("app/views")

// Ignore multiple file
views.file.ignore("**/_*.html.ejs")

// Register multiple file
views.file.add("**/*.html.ejs", {
  // Remove .ejs extension
  output: { ext: "" },

  // Disable caching
  cache: false,

  // Set custom tag for fitering
  tag: "entry:html"
})

const styles = pipeline.source.add("app/styles")
// Register a pattern
styles.file.add("**/*.styl", {
  output: { ext: ".css" },
  tag: "entry:css"
})

const app = pipeline.source.add("app")
// Register a directory
app.directory.add('assets', {
  output: 'resources',

  // Apply rules to files or subdirectories, you can only set cache, output and ignore fields
  fileRules: [
    {
      glob: "**/*.jpg",
      cache: true
    }
  ]
})

// Register a pattern or path for copy
app.fs.copy("assets/**/*")

// Resolve pattern and path, then update manifest
pipeline.fetch()

// Perform copy/move/symlink
await pipeline.copy()

console.log(pipeline.getPath("main.ts")) // main.js
console.log(pipeline.getURL("main.ts")) // http://mycdn.com/main.js
console.log(pipeline.manifest.getAsset("main.ts")) // IAsset object
console.log(pipeline.manifest.getAssetWithSource("main.ts")) // IAssetWithSource object
console.log(pipeline.manifest.findAssetFromOutput("main.js")) // IAsset object
console.log(pipeline.manifest.findSource("main.ts")) // Source object
```

## Documentation

### Pipeline

```ts
// UUID
pipeline.uuid

// Display logs (Default: false)
pipeline.verbose

// Output path builder (Default: "public")
pipeline.output

// Host url builder (Default: origin="", pathname="/")
pipeline.host

// CWD path builder (Default: process.cwd())
pipeline.cwd

// Clone pipeline
pipeline.clone("hashKey")

// Fetch directories, files, update tree and update manifest
pipeline.fetch(force)

// Perform copy/move/symlink
pipeline.copy()

// Logger
pipeline.log("some logs")

// Get path
pipeline.getPath("inputPath", { from: "relativePath", cleanup: false })

// Get url
pipeline.getUrl("inputPath", { from: "relativePath", cleanup: false })
```

### Cache

```ts
// Toggle cache
pipeline.cache.enabled = false

// Set hash key
pipeline.cache.key = hashKey

// Set cache type "hash" | "version" (Default: "hash")
pipeline.cache.type = "hash"

// Clone cache object
pipeline.cache.clone()

// Return "anyValue-hash"
pipeline.cache.hash("anyValue")

// Return "anyValue?v=hashKey"
pipeline.cache.version("anyValue")

// Generate hash string
pipeline.cache.generateHash("anyValue")
```

### Manifest

```ts
// Save on disk at each change (default: false)
pipeline.manifest.saveAtChange = false

// Save on disk (default: true)
pipeline.manifest.saveOnDisk = true

// Read on disk (default: false)
pipeline.manifest.readOnDisk = false

pipeline.manifest.manifestPath

// Clone manifest
pipeline.manifest.clone()

// Check if manifest file is created
pipeline.manifest.fileExists()

// Save manifest file
pipeline.manifest.saveFile()

// Read manifest file
pipeline.manifest.readFile()

// Remove manifest file
pipeline.manifest.removeFile()

// Get Asset object from inputPath
pipeline.manifest.getAsset("inputPath")

// Get AssetWithSource object from inputPath
pipeline.manifest.getAssetWithSource("inputPath")

// Check asset exists
pipeline.manifest.hasAsset("inputPath")

// Add asset
pipeline.manifest.addAsset(asset)

// Remove asset
pipeline.manifest.removeAsset("inputPath")

// Clear manifest
pipeline.manifest.clearAssets()

// Look for Source object from path
pipeline.manifest.findSource("inputPath")

// Look for IAsset object from output
pipeline.manifest.findAssetFromOutput("outputPath")

// Export an array of IAsset[]
pipeline.manifest.export()
pipeline.manifest.export("asset")

// Export an object Record<string, IAsset>
pipeline.manifest.export("asset_key")

// Export an array of IAssetWithSource[]
pipeline.manifest.export("asset_source")

// Export an object Record<string, IAssetWithSource>
pipeline.manifest.export("asset_source_key")

// Export an array of IOutput[]
pipeline.manifest.export("output")

// Export an object Record<string, IOutput>
pipeline.manifest.export("output_key")
```

### Resolver

```ts
// Clone resolver
pipeline.resolver.clone()

// Look for outputPath
pipeline.resolver.resolve("inputPath")

// Convert inputPath to outputPath and return its directory tree
pipeline.resolver.getTree("inputPath")

// Get path
pipeline.resolver.getPath("inputPath", { from: "relativePath", cleanup: false })

// Get url
pipeline.resolver.getUrl("inputPath", { from: "relativePath", cleanup: false })

// Refresh output tree
pipeline.resolver.refreshTree()

// Preview output tree
console.log(pipeline.resolver.view())
```

### Source

```ts
// Clone source
pipeline.source.clone()

// Fetch only directories
pipeline.source.fetch("directory")

// Fetch only files
pipeline.source.fetch("file")

// Perform copy/move/symlink
pipeline.source.copy()

// Add new source
pipeline.source.add("relative_path")

// Get source from its uuid
pipeline.source.get("source_uuid")

// Check source exists
pipeline.source.has("source_uuid")

// Remove source
pipeline.source.remove("source_uuid")

// Return an array of sources
pipeline.source.all()
pipeline.source.all("array")

// Return a Record<uuid, Source>
pipeline.source.all("object")
```

### File pipeline

```ts
const app = pipeline.source.add("./app")

// Clone File object
app.file.clone()

// Add file path or pattern
app.file.add("path_or_pattern", {
  // Remove directory path (optional)
  keepPath: true,

  // Set base directory (optional)
  baseDir: "myDir",

  // Ignore matches (optional)
  ignore: false

  // Rename output path  (optional) (string | TRenameFunction | TRenameObject)
  output: "#{output.base}"

  // Rename cache path  (optional) (string | TRenameFunction | TRenameObject)
  cache: "#{output.name}-#{output.hash}#{output.ext}"

  // A simple string for fitering (optional)
  tag: "myTag"
})

// Ignore file path or pattern
app.file.ignore("ignore_file")

// Resolve paths and patterns, then without updating manifest
app.file.fetch()
```

### Directory pipeline

```ts
const app = pipeline.source.add("./app")

// Clone File object
app.directory.clone()

// Add directory path or pattern
app.directory.add("path_or_pattern", {
  // ... Same options as file.add()

  // Apply rules to files
  fileRules: [
    {
      // Path or pattern
      glob: "path_or_pattern",

      // Ignore matches (optional)
      ignore: false

      // Rename output path  (optional) (string | TRenameFunction | TRenameObject)
      output: "#{output.base}"

      // Rename cache path  (optional) (string | TRenameFunction | TRenameObject)
      cache: "#{output.name}-#{output.hash}#{output.ext}"

      // A simple string for fitering (optional)
      tag: "myTag"
    }
  ]
})

// Ignore directory path or pattern
app.directory.ignore("ignore_directory")

// Resolve paths and patterns, without updating manifest
app.directory.fetch()
```

### Shadow pipeline

```ts
// Add a directory shadow path or pattern (the source directory does exist, but the output it is)
app.shadow.addFile("shadowFilePath", {
  // Rename output path  (optional) (string | TRenameFunction | TRenameObject)
  output: "#{output.base}"

  // Rename cache path  (optional) (string | TRenameFunction | TRenameObject)
  cache: "#{output.name}-#{output.hash}#{output.ext}"

  // A simple string for fitering (optional)
  tag: "myTag"
})

// Add a directory shadow path or pattern (the source directory does exist, but the output it is)
app.shadow.addDirectory("shadowDirectoryPath", {
  // ... Same options as shadow.addFile
})

// Resolve paths and patterns, without updating manifest
app.shadow.fetch()
```

### File System

```ts
// Number of items by chunk to perform asynchronously
app.fs.chunkCount = 15

// Clone FileSystem object
app.fs.clone("path_or_pattern")

// Register a move
app.fs.move("path_or_pattern")

// Register a copy
app.fs.copy("path_or_pattern")

// Register a symlink
app.fs.symlink("path_or_pattern")

// Ignore
app.fs.ignore("path_or_pattern")

// Perform copy/move/symlink to updated files only (based on mtime)
app.fs.apply()
```

## More examples

* [Files - Unit tests](./test/files.spec.ts)
* [Rename - Unit tests](./test/rename.spec.ts)
* [Directories - Unit tests](./test/directories.spec.ts)
* [FS - Unit tests](./test/fs.spec.ts)
* [Manifest - Unit tests](./test/manifest.spec.ts)
* [Multiple sources - Unit tests](./test/multiple-sources.spec.ts)
