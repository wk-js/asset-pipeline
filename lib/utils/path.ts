import Path from 'path';

/**
 * Clean path
 */
export function clean_path(input: string) {
  const i = input.split('/')
  i.push('')
  input = Path.normalize(i.join('/')).slice(0, -1)
  return input
}

/**
 *
 */
export function to_unix_path(pth: string) {
  pth = pth.replace(/\\/g, '/')

  const double = /\/\//
  while (pth.match(double)) {
    pth = pth.replace(double, '/') // node on windows doesn't replace doubles
  }

  return pth
}

/**
 * Remove extras
 */
export function remove_search(pth: string) {
  return pth.split(/\?|\#/)[0]
}