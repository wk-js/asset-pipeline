# asset-pipeline <!-- omit in toc -->

Handle your assets like a boss

- [Example](#example)
- [Documentation](#documentation)
  - [Pipeline](#pipeline)
  - [FileList](#filelist)
  - [Transformer](#transformer)
  - [Transform Rule](#transform-rule)
  - [Resolver](#resolver)
  - [Plugin - FileSystem](#plugin---filesystem)
  - [Plugin - Manifest](#plugin---manifest)
- [More examples](#more-examples)

## Example

```ts
import { AssetPipeline } from "asset-pipeline";

const pipeline = new AssetPipeline()

pipeline.rules.saltKey = "saltKey"

pipeline.rules.cacheBreak = true

// Set origin (Rendered: http://mycdn.com/)
pipeline.host.setOrigin("http://mycdn.com")

// Set pathname (Rendered: http://mycdn.com/public)
pipeline.host.setPathname("public")

// Create a source object a path relative to cwd
const APP_PATH = pipeline.createPath("app/scripts")

// Typescript
pipeline.files
  .include(APP_PATH.join("scripts/main.ts"))
pipeline.rules
  .add("*.ts")
  .extension(".js")
  .keepDirectory(false)

// Stylus
pipeline.files
  .include(APP_PATH.join("styles/main.styl"))
pipeline.rules
  .add(APP_PATH.join("styles/main.styl"))
  .extension(".css")
  .keepDirectory(false)

// Views
pipeline.files
  .include(APP_PATH.join("views/**/*.html.ejs"))
  .exclude(APP_PATH.join("views/**/_*.html.ejs"))
pipeline.rules
  .add(APP_PATH.join("views/**/*.html.ejs"))
  .extension(".html")
  .keepDirectory(false)
  .cachebreak(false)

// Assets
pipeline.files
  .include(APP_PATH.join("assets/**/*"))
pipeline.rules
  .add(APP_PATH.join("assets/**/*"))
  .relative(APP_PATH)

// Resolve pattern and path, then update manifest
pipeline.fetch()

// Logs
console.log(pipeline.resolver.getPath("main.ts")) // /main.js
console.log(pipeline.resolver.getURL("main.ts")) // http://mycdn.com/main.js
```

## Documentation

### Pipeline

```ts
// Display logs (Default: false)
pipeline.logging = false

// Fetch files and apply transformations
pipeline.fetch(forceResolve?)

// Append files to transform
pipeline.append(forceResolve?)

// Get options from plugins
pipeline.options("pluginOptions")

// Register a new plugin
await pipeline.plugin({
  name: "myPlugin",
  setup(pipeline: Pipeline) {
    // Do something
  }
})

// Create a path builder
const app = pipeline.createPath("app")
app.join("scripts").os() // app/cripts

// Listen when files and patterns are resolved
pipeline.events.on("resolved", (paths) => {
  console.log(paths)
})

// Listen when paths ared transformed
pipeline.events.on("transformed", (results) => {
  console.log(results)
})
```

### FileList

```ts
// Add file path or pattern
pipeline.files.include("app/scripts/*.ts")
pipeline.files.include("app/assets/image.jpg")

// Ignore file path or pattern
pipeline.files.exclude("app/scripts/_*.ts")

// Add non-existing file path
pipeline.files.exclude("app/scripts/generated/PAGE.ts")

// Resolve paths and patterns
pipeline.files.resolve()
```

### Transformer

```ts
// Set salt key
pipeline.saltKey = "saltKey"

// Toggle cachebreak
pipeline.cachebreak = false

// Create a transform rule for a pattern
pipeline.rules.add("app/scripts/*.ts") // TransformRule

// Delete a transform rule for a pattern
pipeline.rules.delete("app/scripts/*.ts")

// A transform exists for this path or not
pipeline.rules.match("app/scripts/main.ts")

// Transform an array of paths
pipeline.rules.transform(["app/scripts/main.ts"]) // TransformResult[]
```

### Transform Rule

```ts
pipeline.rules.add("app/scripts/main.ts")

// Rewrite filemae
.name("bundle.ts") // will create public/app/scripts/bundle.ts

// Set extension
.extension(".js") // will create public/app/scripts/bundle.js

// Rewrite directory
.directory("scripts") // will create public/scripts/bundle.js

// Keep directory
.directory("scripts") // will create public/scripts/bundle.js

// Add base directory
.keepDirectory(false) // will create public/bundle.js

// Add relative path
.relative("resources") // will create public/bundle.js

// Add relative path
.cachebreak(true) // will create public/bundle-1ae2da2ed1ae231.js

// Set path
.path("main.js") // will create public/main-1ae2da2ed1ae231.js

// Apply transformation
.apply("app/scripts/main.ts", {
  cachebreak: true,
  saltKey: "saltKey"
}) // TransformResult
```

### Resolver

```ts

// Output path builder (Default: "public")
pipeline.output.set("public")

// Host url builder (Default: origin="", pathname="/")
pipeline.host.set("http://mycdn.com/")

// Register alias. Instead of using "app/scripts/main.ts" as input, you can write "main.ts"
pipeline.resolver.alias("app/scripts")

// Return an array of outputs. If tag is given, returns outputs matching the tag
pipeline.resolver.resolve("main.ts") // "/main.js"
pipeline.resolver.resolve("main.ts", "anyTag") // "/main.js"
pipeline.resolver.resolve("main.ts", "esm") // "/main.esm.js"

// Get path. If tag is given, return output path matching the tag
pipeline.resolver.getPath("main.ts") // "/main.js"
pipeline.resolver.getPath("main.ts", "anyTag") // "/main.js"
pipeline.resolver.getPath("main.ts", "esm") // "/main.esm.js"

// Get URL. If tag is given, return output URL matching the tag
pipeline.resolver.getUrl("main.ts") // "http://mycdn.com/main.js"
pipeline.resolver.getUrl("main.ts", "anyTag") // "http://mycdn.com/main.js"
pipeline.resolver.getUrl("main.ts", "esm") // "http://mycdn.com/main.esm.js"

// Get path. If tag is given, return output path matching the tag
pipeline.resolver.getOutputPath("main.ts") // "public/main.js"
pipeline.resolver.getOutputPath("main.ts", "anyTag") // "public/main.js"
pipeline.resolver.getOutputPath("main.ts", "esm") // "public/main.esm.js"

// Try to find the  original input
pipeline.resolver.findInputPath("main.js") // TransformResult

// Try to find the  original input
pipeline.resolver.filter(([input, transformed]) => {
  return input === "app/scripts/main.ts"
}) // [TransformResult]
```

### Plugin - FileSystem

```ts
const { FsPlugin } = require("asset-pipeline")
pipeline.plugin(FsPlugin)

const fs = p.options("fs")

// Number of items by chunk to perform asynchronously
fs.chunkCount = 15

// Register a move
fs.move("path_or_pattern")

// Register a copy
fs.copy("path_or_pattern")

// Register a symlink
fs.symlink("path_or_pattern")

// Ignore
fs.ignore("path_or_pattern")

// Perform copy/move/symlink to updated files only (based on mtime)
fs.apply(force?) // Force

// Listen when a new file is moved/copied/symlinked
fs.events.on("newfilecopied", ([from, to]) => {
  console.log(from, to)
})

// Same event
pipeline.events.on("newfilecopied", ([from, to]) => {
  console.log(from, to)
})
```


### Plugin - Manifest

```ts
const { ManifestPlugin } = require("asset-pipeline")
pipeline.plugin(ManifestPlugin)

const manifest = p.options("manifest")

// Save on disk (default: true)
manifest.saveOnDisk = true

// Override pipeline
manifest.set({
  "saltKey": "",
  "date": "2021-02-04T18:43:26.338Z",
  "aliases": [
    "app/scripts"
  ],
  "entries": [
    [
      "app/assets/image.jpg",
      {
        "path": "assets/image.jpg",
        "tag": "default",
        "priority": 0
      }
    ],
    [
      "app/scripts/main.ts",
      {
        "path": "main.js",
        "tag": "default",
        "priority": 0
      }
    ],
    [
      "app/scripts/main.ts",
      {
        "path": "main.esm.js",
        "tag": "esm",
        "priority": 0
      }
    ]
  ]
})

// Set manifest path
manifest.path.set("tmp/manifest.json")

// Check if manifest is created
manifest.exists()

// Save manifest
manifest.save()

// Read manifest and override pipeline
manifest.read()

// Remove manifest on disk
manifest.delete()
```

## More examples

* [Rules - Unit tests](./test/rules.spec.ts)
* [Resolver - Unit tests](./test/resolver.spec.ts)
* [Plugin - FileSystem - Unit tests](./test/fs.spec.ts)
* [Plugin - Manifest - Unit tests](./test/manifest.spec.ts)
