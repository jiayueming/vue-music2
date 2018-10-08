import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  singer: {},
  playing: false, // 是否播放
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence, // 播放模式
  currentIndex: -1, // 当前播放歌曲的索引
  disc: {}, // 歌单
  topList: {},
  searchHistory: loadSearch(), // 本地缓存取
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
}
export default state
