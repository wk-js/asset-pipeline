'use strict'

class AssetMove {

  constructor(assetpipeline) {
    this.assets  = assetpipeline
    this.pending = []
  }

  get ABSOLUTE_LOAD_PATH() {
    return this.assets.ABSOLUTE_LOAD_PATH
  }

  get ABSOLUTE_DST_PATH() {
    return this.assets.ABSOLUTE_DST_PATH
  }

  /**
   * Add a file for a symlink
   *
   * @param {String} input
   * @param {String} output
   *
   * @memberOf AssetPipeline
   */
  symlink( input, output ) {
    this._copyOrSymlink( 'symlink', input, output )
  }


  /**
   * Add a file for a copy
   *
   * @param {String} input
   * @param {String} output
   *
   * @memberOf AssetPipeline
   */
  copy( input, output ) {
    this._copyOrSymlink( 'copy', input, output )
  }


  /**
   * Add a file for a copy/symlink
   *
   * @param {String} tyype
   * @param {String} input
   * @param {String} output
   *
   * @memberOf AssetPipeline
   */
  _copyOrSymlink( type, input, output ) {
    input  = _cleanPath( input )

    if (typeof output !== 'string') {
      output = input
    } else {
      output = _cleanPath( output )
    }

    this.pending.push({
      from: join( this.ABSOLUTE_LOAD_PATH, input ),
      to:   join( this.ABSOLUTE_DST_PATH, output ),
      type: type
    })
  }

  /**
   * Copy or symlink files
   *
   * @memberOf AssetPipeline
   */
  process() {
    // Proceed move
    this.pending.forEach(( item ) => {
      this._move(item)
    })
  }

  _move( item ) {
    let from = item.from
    let to   = item.to

    const moveOperation = item.type === 'symlink' ? 'ensureSymlink' : 'copy'

    const move = function(from, to) {
      if (!fs.existsSync(from)) {
        console.log( `"${from}" does not exit.` )
        return
      }

      if (!(path.extname(from) && path.extname(to))) {
        if (path.extname(from)) from = path.dirname(from)
        if (path.extname(to))   to   = path.dirname(to)
      }

      fs[moveOperation](from, to, (err)=>{
        if (err) console.log( err )
      })
    }

    const FL = new FileList
    FL.include( from )
    FL.forEach((filename) => {

      const itm = this.CACHE[relative(this.ABSOLUTE_LOAD_PATH, filename)]

      if (!itm) return

      from = filename
      to   = join( this.ABSOLUTE_DST_PATH, itm.cache || itm.output )

      move(from, to)

    })

  }

}

module.exports = AssetMove