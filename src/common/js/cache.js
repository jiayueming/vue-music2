import storage from 'good-storage'
const SEARCH_KEY = '__search__'
const SEACH_MAX_LENGTH = 15
const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200
const FAVORITE_KEY = '__FAVORITE__'
const FAVORITE_MAX_LENGTH = 200

function insertArray (arr, val, compare, maxLen) {
  // arr被比较的字符串，compare为比较的条件，maxLen数组最大长度
  const index = arr.findIndex(compare)
  if (index === 0) { // 如果index为真且下标为0，说明它存在且排在第一，就什么都不做
    return
  }
  if (index > 0) { // 如果大于0，但不在第一位，则要先把原来的删除然后它push在数组第一位
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) { // maxLen若为真，但arr的长度超出了它则要把最后一位删除
    arr.pop()
  }
}
/* findIndex为找到符合条件元素的下标并返回 */
function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}
export function saveSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEACH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}
export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}
export function saveFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}
