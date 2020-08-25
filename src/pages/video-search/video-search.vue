<template>
    <view class="wrap">
        <view class="search-box">
            <SearchBtn placeholder="请输入电影名称搜索" v-model="search" @searchClick="searchClick"></SearchBtn>
        </view>
        <view class="re-search" v-if="sourceNo > 1 && sourceNo !== -1">
            <text>没有搜到或搜到的都不是您想要的？可以切换到其它来源再搜一次</text>
            <button type="primary" @click="searchClick(true)">
                切换到来源{{sourceNo}}再次搜索
            </button>
        </view>
        <view class="list" v-if="list && list.length">
            <view class="item" v-for="(value, index) in list" :key="index" @tap="toDetail(value)">
                <view class="content">
                    <image mode="widthFix" class="image" :src="value.coverImg"></image>
                    <view class="des">
                        <view class="title">{{value.videoName}}</view>
                        <view v-if="value.director" class="time">{{value.director}}</view>
                        <view v-if="value.actor" class="time">{{value.actor}}</view>
                        <view v-if="value.videoType" class="time">{{value.videoType}}</view>
                        <view v-if="value.time" class="time">{{value.time}}</view>
                        <view class="label-box">
                            <text class="label" v-if="showPlay(value)">可播放</text>
                            <text class="label" v-if="showDown(value)">可下载</text>
                        </view>
                    </view>
                </view>
                <view class="res-list">
                    <!--					<view class="res-list-item" v-for="resItem in value.resource" :key="resItem.src">-->
                    <!--						<view @click="copy(resItem)">{{resItem.src}}</view>-->
                    <!--						<view @click="copy(resItem)">{{resItem.text}}</view>-->
                    <!--					</view>-->
                </view>
            </view>
        </view>
        <view v-else class="center">
            暂无数据 <br>
            输入电影名称进行搜索 <br>
            电影搜索可能耗时较长，请耐心等待。
        </view>
    </view>
</template>

<script>
  import SearchBtn from '../components/search-btn'

  import {
    mapState,
    mapMutations
  } from 'vuex'

  export default {
    data() {
      return {
        search: '',
        // 搜索源编号 1,2,3... -1:没有了
        sourceNo: 1,
        list: [],
        loading: false
      };
    },
    components: { SearchBtn },
    computed: mapState(['userInfo', 'config']),
    methods: {
      ...mapMutations(['getUserInfo', 'setStateData']),

      showPlay (data) {
        if(!this.config.showVideo) {
          return false
        }
        return data.urlList && data.urlList.length >0
      },
      showDown (data) {
        if(!this.config.showVideo) {
          return false
        }
        return (data.downList && data.downList.length >0) || (data.resource && data.resource.length > 0)
      },
      async searchClick(isAgain) {
        if (isAgain) { // 再次搜索
        } else {
          this.sourceNo = 1
        }
        if (!this.search) {
          uni.showToast(
            {
              title: '请输入电影名称搜索!',
              icon: 'none',
            }
          );
          return
        }
        if (this.loading) {
          return
        }
        uni.showLoading({
          title: '搜索中...'
        })
        this.loading = true
        let res
        try {
          res = await wx.cloud.callFunction({
            name: 'getSearchVideo',
            data: {
              search: this.search || '肖申克',
              sourceNo: this.sourceNo
            }
          })
          uni.hideLoading()
          this.loading = false
        } catch (e) {
          uni.hideLoading()
          this.loading = false
          uni.showToast(
            {
              title: '搜索失败，请修改关键字重试',
              icon: 'none',
            }
          );
        }
        if (res && res.errMsg === 'cloud.callFunction:ok') {
          this.list = res.result.list || []
          this.sourceNo = res.result.nextSourceNo
        } else { // 可能是超时
          this.sourceNo++
          uni.showToast(
            {
              title: `请切换来源重试${res.result.msg}`,
              icon: 'none',
            }
          );
        }
      },
      copy(item) {
        let text = `${item.src}\n${item.text}`
        wx.setClipboardData({
          data: text,
          success(res) {
            wx.getClipboardData({
              success(res) {
                console.log(res.data) // data
              }
            })
          }
        })
      },
      toDetail(data) {
        console.log(this.config)
        if (this.config && this.config.showVideo) {
          try {
            wx.setStorageSync('videoInfo', JSON.stringify(data))
          } catch (e) {
          }
          uni.navigateTo({
            url: `/pages/video-search/detail`
          })
        }
      }
    },
    // 加了这个页面才可以被分享
    onShareAppMessage: function (res) {
    },
    async onLoad() {
    }
  }
</script>

<style lang="stylus" scoped>
    @import "../../uni.styl"
    .wrap
        display block
        width 100%

    .search-box
        box-sizing border-box
        display block
        width 100%
        padding 10px

    .list
        display flex
        flex-direction column

        .item
            margin 10px 5px
            padding 10px
            border-radius 5px
            background-color $uni-list-item-color
            display flex
            flex-direction column

            .content
                display flex

                .image
                    width 100px
                    margin-right 10px

                .des
                    flex 1
                    display flex
                    flex-direction column

                    .title
                        font-size 16px

                    .time
                        margin-top 10px
                        font-size 12px

            .res-list
                display block

                .res-list-item
                    margin 5px 0
                    display block

                    view
                        word-break break-all


    .center
        text-align center
        margin 20px 0
        color #999
        width 100%
        display block

    .re-search
        display block
        text-align center
    .label-box
        display flex
        padding-top 5px
        .label
            background-color #1aad19
            color #fff
            padding 0 3px
            border-radius 2px
            line-height 18px
            font-size 12px
            margin-right 3px

</style>
