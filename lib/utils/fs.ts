import * as Fs from "fs";
import { promise, reduce } from "when";
import when from "when";
import { FileList } from "filelist";
import { normalize, dirname, isAbsolute } from "path";

export function isFile(path:string) {

  try {
    const stat = Fs.statSync( path )
    if (!stat.isFile()) throw 'Not a file'
  } catch(e) {
    return false
  }

  return true

}

export function isDirectory(path:string) {

  try {
    const stat = Fs.statSync( path )
    if (!stat.isDirectory()) throw 'Not a file'
  } catch(e) {
    return false
  }

  return true

}

export function exists(path:string) {
  try {
    Fs.statSync( path )
  } catch(e) {
    return false
  }

  return true
}

export function copy(fromFile:string, toFile:string) {
  return promise<boolean>(function(resolve:Function, reject:Function) {

    let fileValid = fromFile !== toFile
    if (!fileValid) throw `Cannot copy '${fromFile}' to the same path`

    fileValid = isFile(fromFile)
    if (!fileValid) throw `'${fromFile}' is not a file`

    ensureDir(dirname( toFile )).then(function() {
      const rs = Fs.createReadStream( fromFile )
      const ws = Fs.createWriteStream( toFile  )

      ws.on('error', function(error:Error) {
        reject(error)
      })
      rs.on('error', function(error:Error) {
        reject(error)
      })
      rs.on('end', function() {
        resolve(true)
      })

      rs.pipe( ws, { end: true })
    })

  })
}

export function remove(file:string) {
  return promise<boolean>(function(resolve:Function, reject:Function) {

    if (!isFile(file)) throw 'Cannot be removed. This is not a file.'

    Fs.unlink(file, function(err) {
      if (err) {
        reject(err)
        return
      }

      resolve(true)
    })

  })
}

export function move(fromFile:string, toFile:string) {
  return copy(fromFile, toFile)
  .then(() => remove(fromFile))
}

export function rename(fromFile:string, toFile:string) {
  return move(fromFile, toFile)
}

export function ensureDir(path:string) {
  path = normalize(path)

  if (isDirectory(path)) return when(path)

  const dirs = path.split(/\\|\//)
  const initial = isAbsolute(path) ? dirs.shift() as string : '.'
  const slash = process.platform == 'win32' ? '\\' : '/'

  return reduce<string>(dirs, function(res:string, d:string) {
    if (d === '.') return res

    res += slash + d

    if (!isDirectory(res)) {
      return promise<string>(function(resolve:Function, reject:Function) {
        Fs.mkdir(res, function(err) {
          if (err && err.code !== 'EEXIST') {
            reject(err)
            return
          }

          resolve(res)
        })
      })
    }

    return res
  }, initial)

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
  return ensureDir(dirname(file)).then(function() {
    return promise<boolean>(function(resolve:Function, reject:Function) {
      Fs.writeFile(file, content, function(err:Error) {
        if (err) {
          reject(err)
          return
        }

        resolve(true)
      })
    })
  })
}

export function readFile(file:string, options?: { encoding?: string | null; flag?: string; } | string | undefined | null) {
  if (!isFile(file)) throw 'This is not a file.'

  return promise<Buffer>(function(resolve:Function, reject:Function) {
    Fs.readFile(file, options, function(err:Error, data:string | Buffer) {
      if (err) {
        reject(err)
        return
      }

      resolve(data)
    })
  })
} 

export type EditFileCallback = (value: string | Buffer) => string | Buffer

export function editFile(file:string, callback:EditFileCallback) {
  return readFile(file).then(callback).then(function(content:string | Buffer) {
    return writeFile(content, file)
  })
}