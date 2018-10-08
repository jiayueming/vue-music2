<template>
  <div class="singer" ref="singer">
    <!--接受listview派发的事件-->
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import {getSingerList} from 'api/singer'
import {ERR_OK} from 'api/config'
import Singer from 'common/js/singer' // 集合成一个类
import ListView from 'base/listview/listview'
import {mapMutations} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const HOT_SINGER_LEN = 10
const HOT_NAME = '热门'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getsingerList()
  },
  components: {
    ListView
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh() // 检测到playlist就及时刷新
    },
    // 子父组件传数据，接受事件
    selectSinger (singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      this.setSinger(singer)
    },
    _getsingerList () {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
        }
      })
    },
    _normalizeSinger (list) {
      // 定义歌手数据的空对象
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      // 对获取到的歌手数据进行格式转化
      list.forEach((item, index) => {
        // 对前10进行处理
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        // 赋值key,按字母排序
        const key = item.Findex
        // 如果map对象没有key这个属性，那么我们就创建一个对象
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // map对象的数据结构就变为: map = {hot:{hot的数据},A:{title:'A',items:[{id:'',name:'',avatar:''},{}]},B:{数据},...}
      // 为了得到有序列表，我们需要处理map
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        // 把它们分别存放两个数组中
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 按字母顺序排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 最后两个数组合并
      return hot.concat(ret)
    },
    // 你可以在组件中使用 this.$store.commit('xxx') 提交 mutation，
    // 或者使用 mapMutations 辅助函数将组件中的 methods 映射为 store.commit 调用（需要在根节点注入 store）
    // mapMutations简化了commit那个动作
    ...mapMutations({
      setSinger: 'SET_SINGER' // 将 `this.setSinger()` 映射为 `this.$store.commit('setSinger')`
    })
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  /*better-scroll的父容器的高度是要固定的，子元素的高度要撑开它才能滚动*/
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
