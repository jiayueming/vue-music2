<template>
  <scroll class="suggest" :pullup="pullup" @scrollToEnd="searchMore"
          :data="result" ref="suggest" :beforeScroll="beforeScroll" @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li class="suggest-item" @click="selectItem(item)" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore"></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
import {createSong, processSongsUrl} from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import NoResult from 'base/no-result/no-result'
import {mapMutations, mapActions} from 'vuex'
const TYPE_SINGER = 'singer'
const perpage = 20
export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true, // 判断是否滑倒底端,flag
      beforeScroll: true
    }
  },
  methods: {
    search () {
      this.page = 1
      this.$refs.suggest.scrollTo(0, 0) // 因为在监听query的变化，每次都要重新search，所以每次把值都重新初始化
      this.hasMore = true
      // query搜索的内容,page初始值为1，perpage页面size
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.data)
          this._genReasult(res.data).then((result) => {
            this.result = result
          })
          this._checkMore(res.data) // 检查是否滑倒底部
        }
      })
    },
    _genReasult (data) {
      let ret = []
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        // var a = {a:1,b:2};var b={c:1};var c=[]; c.push({a,b});// 输出[{a:1,b:2},{c:1}];
        // 如果搜索为歌手，则增加一个type字段
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }

      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs)
        return ret
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    getIconCls (item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName (item) {
      if (item.type === TYPE_SINGER) {
        //      return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    _checkMore (data) {
      const song = data.song
      if (!song.list.length || song.curnum + (song.curpage - 1) * perpage >= song.totalnum) {
        this.hasMore = false
      }
    },
    searchMore () {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          // concat拼接数组
          this.result = this.result.concat(this._genReasult(res.data))
          this._checkMore(res.data) // 检查是否滑倒底部
        }
      })
    },
    listScroll () {
      this.$emit('listScroll')
    },
    refresh () {
      this.$refs.suggest.refresh()
    },
    selectItem (item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        // 插入播放列表
        this.insertSong(item)
      }
      // 触发保存历史记录
      this.$emit('select', item)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER' // 将 `this.setSinger()` 映射为 `this.$store.commit('setSinger')`
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    // 页面向suggest发送我变化了，搜索接口便自动执行
    query () {
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
