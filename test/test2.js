'use strict'

const { List } = require('../js/utils/list')

let list = new List()

list.push('hello')
list.push('world')
list.push('mf')
list.push('surprise')

list.unshift('woot?')

list.foreach(function(item) {
  // console.log( item )
})

// console.log( list.toArray() )

list = list.filter(function(item) {
  return item.length === 5
})

console.log( list.toArray() )
// console.log( list.getFirst() )
// console.log( list.getLast() )
// console.log( list.getItem() )