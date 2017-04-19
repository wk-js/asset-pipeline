const AssetPipeline = require('../lib/index.js')
  , fs              = require('fs-extra')
  , assert          = require('assert')

task('beforeTest', { visible: false }, function() {
  fs.mkdirpSync('./test/tmp/src')
  fs.mkdirpSync('./test/tmp/dst')

  fs.writeFileSync('./test/tmp/src/file0.txt', "foo")
  fs.writeFileSync('./test/tmp/src/file1.txt', "bar")
  fs.writeFileSync('./test/tmp/src/file2.txt', "john")
})

task('afterTest', { visible: false }, function() {
  fs.removeSync('./test/tmp')
})

namespace('tests', function() {

  const nm = this.getPath.bind(this)

  task('default', { visible: false }, [
    nm('include_exclude')
  ])


  task('include_exclude', { visible: false }, function() {

    wk.Print.log('[test] Include and exclude')

    const AS = new AssetPipeline

    AS.debug = true

    AS.LOAD_PATH = './test/tmp/src'
    AS.DST_PATH  = './test/tmp/dst'

    AS.add('*.txt', { cache: true })
    AS.remove('file1.txt')

    AS.resolve()

    assert(Object.keys(AS.CACHE).length === 2, 'Problem')
    assert(typeof AS.CACHE['file1.txt'] === 'undefined')
    assert(fs.existsSync(AS.getManifestPath()))

    wk.Print.log(wk.Print.green('  > OK'))
  })

})

task('default', [ 'test:beforeTest', 'test:tests', 'test:afterTest' ])