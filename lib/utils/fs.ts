import * as fs from "fs";
import { promise, all, reduce } from "when";
import when from "when";
import { FileList } from "filelist";
import { normalize, dirname } from "path";

export function isFile(path:string) {

  try {
    const stat = fs.statSync( path )
    if (!stat.isFile()) throw 'Not a file'
  } catch(e) {
    return false
  }

  return true

}

export function isDirectory(path:string) {

  try {
    const stat = fs.statSync( path )
    if (!stat.isDirectory()) throw 'Not a file'
  } catch(e) {
    return false
  }

  return true

}

export function copy(fromFile:string, toFile:string) {
  return promise(function(resolve:Function, reject:Function) {

    let fileValid = fromFile !== toFile
    if (!fileValid) throw `Cannot copy '${fromFile}' to the same path`

    fileValid = isFile(fromFile)
    if (!fileValid) throw `'${fromFile}' is not a file`

    ensureDir(dirname( toFile )).then(function() {
      const rs = fs.createReadStream( fromFile )
      const ws = fs.createWriteStream( toFile  )

      ws.on('error', function() {
        reject.apply(null, arguments)
      })
      rs.on('error', function() {
        reject.apply(null, arguments)
      })
      rs.on('end', function() {
        resolve.apply(null, arguments)
      })

      rs.pipe( ws, { end: true })
    })

  })
}

export function remove(file:string) {
  return promise(function(resolve:Function, reject:Function) {

    if (!isFile(file)) throw 'Cannot be removed. This is not a file.'

    fs.unlink(file, function(err) {
      if (err) {
        reject(err)
        return
      }

      resolve({})
    })

  })
}

export function move(fromFile:string, toFile:string) {
  return reduce([
    function() { return copy(fromFile, toFile) },
    function() { return remove(fromFile)       }
  ], function(res:null, action:Function) {
    return action()
  }, null)
}

export function rename(fromFile:string, toFile:string) {
  return move(fromFile, toFile)
}

export function ensureDir(path:string) {
  path = normalize(path)

  if (isDirectory(path)) return when(path)

  const dirs = path.split( '/' )

  return reduce(dirs, function(res:string, d:string) {
    if (d === '.') return res

    res += '/' + d

    if (!isDirectory(res)) {
      return promise<string>(function(resolve:Function, reject:Function) {
        fs.mkdir(res, function(err) {
          if (err && err.code !== 'EEXIST') {
            reject(err)
            return
          }

          resolve(res)
        })
      })
    }

    return res
  }, '.')

}

export function fetch(include:string|string[], exclude?:string|string[]) {
  const FL = new FileList

  const includes = Array.isArray(include) ? include : [ include ]
  const excludes = Array.isArray(exclude) ? exclude : exclude ? [ exclude ] : []

  includes.forEach((inc) => FL.include( inc ))
  excludes.forEach((exc) => FL.exclude( exc ))

  const files = FL.toArray().filter(function(file:string) {
    return isFile( file )
  })

  return files
}

export function fetchDirs(include:string|string[], exclude?:string|string[]) {
  const FL = new FileList

  const includes = Array.isArray(include) ? include : [ include ]
  const excludes = Array.isArray(exclude) ? exclude : exclude ? [ exclude ] : []

  includes.forEach((inc) => FL.include( inc ))
  excludes.forEach((exc) => FL.exclude( exc ))

  const files = FL.toArray().filter(function(file:string) {
    return isDirectory( file )
  })

  return files
}

export function writeFile(content:string | Buffer, file:string) {
  ensureDir(dirname(file))

  return promise(function(resolve:Function, reject:Function) {
    fs.writeFile(file, content, function(err:Error) {
      if (err) {
        reject(err)
        return
      }

      resolve({})
    })
  })
}

export function readFile(file:string) {
  if (!isFile(file)) throw 'This is not a file.'

  return promise<Buffer>(function(resolve:Function, reject:Function) {
    fs.readFile(file, function(err:Error, data:Buffer) {
      if (err) {
        reject(err)
        return
      }

      resolve(data)
    })
  })
}

export function editFile(file:string, callback:(value: string | Buffer) => string | Buffer) {
  return readFile(file).then(callback).then(function(content:string | Buffer) {
    return writeFile(content, file)
  })
}