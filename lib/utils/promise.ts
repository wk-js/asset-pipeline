export function promise<T>(callback: (resolve: (value: T | PromiseLike<T> | undefined) => void, reject: (reason: any) => void) => void) {
  return new Promise<T>(callback)
}

export function promiseResolved<T>(value: T) {
  return promise<T>((resolve) => {
    resolve(value)
  })
}