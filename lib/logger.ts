let _verbose = false

export function verbose(enable?: boolean) {
  if (typeof enable === "boolean") {
    _verbose = enable
  }
  return _verbose
}

export function info(...args: any[]) {
  if (_verbose) console.log("[asset-pipeline]", ...args)
}