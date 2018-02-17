export class List<T> {

  protected _next?:List<T>
  protected _prev?:List<T>

  protected _first:List<T>
  protected _last:List<T>

  protected _item?:T

  constructor() {
    this._first = this
    this._last  = this
  }

  push(item:T) {
    let base: List<T> | undefined = this
    while( base != undefined ) {
      let next: List<T> | undefined = base._next
      if (next) {
        base = next
      } else {
        next = new List<T>()

        next._item  = item

        next._prev  = base
        base._next  = next
        next._last  = next
        next._first = base._first

        let b:List<T> | undefined = base._first
        while (b) {
          b._last = next
          b = b._next
        }

        break;
      }
    }
  }

  unshift(item:T) {
    let base: List<T> | undefined = this
    while( base != undefined ) {
      let prev: List<T> | undefined = base._prev
      if (prev) {
        base = prev
      } else {
        prev = new List<T>()

        base._first._item = item

        prev._next  = base
        base._prev  = prev
        prev._first = prev
        prev._last  = base._last

        let b:List<T> | undefined = base._last
        while (b) {
          b._first = prev
          b = b._prev
        }

        break;
      }
    }
  }

  foreach(callback:(item:T) => void) {
    let base: List<T> | undefined = this._first
    while( base != undefined ) {
      let next:List<T> | undefined = base._next
      if (next) callback( next._item as T )
      base = next
    }
  }

  map<TT>(callback:(item:T) => TT) {
    const map_list = new List<TT>()

    let base: List<T> | undefined = this._first
    while( base != undefined ) {
      let next:List<T> | undefined = base._next
      if (next) {
        map_list.push( callback( next._item as T ) )
      }
      base = next
    }

    return map_list
  }

  filter(callback:(item:T) => boolean) {
    const filter_list = new List<T>()

    let base: List<T> | undefined = this._first
    while( base != undefined ) {
      let next:List<T> | undefined = base._next
      if (next) {
        if (callback( next._item as T )) {
          filter_list.push( next._item as T )
        }
      }
      base = next
    }

    return filter_list
  }

  getNext() {
    return this._next
  }

  getPrev() {
    return this._prev
  }

  getFirst() {
    return this._first
  }

  getLast() {
    return this._last
  }

  getItem() {
    if (this === this._first) {
      const next = this.getNext()
      return next ? next._item : undefined
    }
    return this._item
  }

  getLength() {
    return this.toArray().length
  }

  toArray() {
    const arr = []
    let base: List<T> | undefined = this._first

    while( base ) {
      let next: List<T> | undefined = base._next
      if (next) arr.push( next._item as T )
      base = next
    }

    return arr
  }

  static fromArray<T>(arr:T[]) {
    const list = new List<T>()

    for (let i = 0, ilen = arr.length; i < ilen; i++) {
      list.push( arr[i] )
    }

    return list
  }

}