const { AssetPipeline } = require( '../js/asset-pipeline' )
const AP = new AssetPipeline

AP.root_path     = process.cwd() + '/../starter-vue'
AP.cacheable     = true
AP.cache_type    = 'version'
AP.force_resolve = true
AP.verbose       = true
AP.asset_host    = 'http://localhost:3000'
AP.data.locale   = 'fr'

AP.addEntry( 'scripts/index.js'       , 'main.js' )
AP.addEntry( 'scripts/vendor/index.js', 'vendor.js' )
AP.addEntry( 'styles/index.styl'      , 'main.css' )


AP.addFile('views/index.html.ejs', {
  keep_path: false,
  rename: 'index.html',
  cache: false,
  alternatives: {
    condition: "asset_data.locale === data",
    outputs: [
      { baseDir: 'en', data: 'en' },
      { baseDir: 'fr', data: 'fr' }
    ]
  }
})

AP.addFile( 'assets/**/*', { cache: false } )
AP.addDirectory( 'assets/**/*', {
  cache: true,
  rename: 'resources',
  keep_path: false,
  alternatives: {
    condition: "asset_data.locale === data",
    outputs: [
      { baseDir: 'en', data: 'en' },
      { baseDir: 'fr', data: 'fr' }
    ]
  }
} )

AP.resolve().then(() => {

  console.log(
    AP.manifest.manifest.assets
    // AP.getPath( 'scripts/index.js#iefix', 'views/index.html.ejs' )
    // AP.getPath( 'assets/fonts' )
    // AP.getPath( 'scripts/index.js' )
    // AP.tree.view()
  )

  AP.manager.copy( 'assets/**/*' )
  AP.manager.process()

})