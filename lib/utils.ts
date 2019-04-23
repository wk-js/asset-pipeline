import { FileList } from "filelist";
import { isDirectory, ensureDir } from "./utils/fs";
import fs from "fs";
import { join, dirname } from "path";
import { promiseResolved } from "./utils/promise";

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

export function isSymbolicLink(path:string) {
  try {
    const stats = fs.statSync( path )
    if (!stats.isSymbolicLink()) throw 'Not a symbolic link'
  } catch(e) {
    return false
  }

  return true
}

export function symlink(fromPath:string, toPath:string) {

  if (isSymbolicLink(toPath)) return promiseResolved<any>({})

  return ensureDir(dirname(toPath)).then(function() {
    return new Promise<any>(function(resolve, reject) {
      fs.symlink(join(process.cwd(), fromPath), join(process.cwd(), toPath), function(err) {
        if (err) {
          reject( err )
          return
        }

        resolve({})
      })
    })
  })

}