<template>
  <view class="new-page">
    <view v-if="config && config.showVideo" class="video-wrap">
      <view class="video-box">
        <video @waiting="videoWaiting"
               id="myVideo"
               class="video"
               :show-casting-button="true"
               @error="videoError"
               @play="onPlay"
               :title="movieName"
               :enable-play-gesture="true"
               picture-in-picture-mode="pop"
               autoplay
               controls
               :src="currentUrl">
        </video>
      </view>
      <view class="source-box" v-if="urlList && urlList.length">
        <view class="line-title">
          <span class="title">播放线路</span>
          <span class="tip">若播放失败，可尝试切换播放线路</span>
        </view>
        <view class="play-line-box">
          <view @click="changeRadio(item.value)"
                :class="item.value === currentUrl?'active item':'item'"
                v-for="(item, index) in urlList" :key="index">
            {{ item.name }}
          </view>
        </view>
      </view>
    </view>
    <view v-else>
      <view class="source-box" v-if="urlList && urlList.length">
        <view class="line-title">
          <span class="title">播放链接</span>
          <span class="tip">点击复制播放链接可到浏览器打开链接观看</span>
        </view>
        <view class="play-line-box">
          <view @click="changeCopy(item.value)"
                :class="item.value === currentUrl?'active item':'item'"
                v-for="(item, index) in urlList" :key="index">
            {{ item.name }}
          </view>
        </view>
      </view>
    </view>
    <view class="down-box" v-if="downList.length || resource.length">
      <view class="line-title">
        <span class="title">下载来源</span>
        <span class="tip">点击复制下载链接可到浏览器下载</span>
      </view>
      <view class="content">
        <view v-for="(value, index) in downList" class="item" :data-item="value" @click="copy1" :key="index">
          {{ value.name }} {{ value.url }}
        </view>
        <view v-for="(value, index) in resource" class="item" :data-item="value" @click="copy2" :key="index">
          {{ value.text }} {{ value.src }}
        </view>
      </view>
    </view>
    <view class="des-box" v-if="videoInfo && videoInfo.decs">
      <view class="item-title">剧情简介</view>
      <view class="content">
        {{ videoInfo && videoInfo.decs }}
      </view>
    </view>
    <ad v-if="config && config.showAd" ad-theme="black" unit-id="adunit-00961fd55c07dbee" ad-type="video"></ad>
    <uni-popup ref="sharePopup" type="center">
      <view class="share-box">
        <view class="text-tip">
          分享给好友，即可观看完整视频。
        </view>
        <button class="share" open-type="share">一键分享</button>
      </view>
    </uni-popup>

    <uni-popup ref="beforeLookAdkPopup" type="center">
      <div class="popup-center-warp">
        <div class="top">
          <div class="title">提示</div>
          <div class="content">
            观看视频广告（约15秒），即可观看完整视频
          </div>
        </div>
        <view class="bottom-btn">
          <button class="btn-item"  @click="showImg">
            如何去除广告？
          </button>
          <button class="btn-item confirm"  @click="confirmLookAd">
            确定
          </button>
        </view>
      </div>
    </uni-popup>
  </view>
</template>

<script>
import * as api from '../../api/api'
import * as util from '../../common/util'
import * as common from '../../common/common.js'
import uniPopup from '../../components/uni-popup/uni-popup'
import {
  mapState,
  mapMutations
} from 'vuex'

export default {
  components: {uniPopup},
  data() {
    return {
      videoInfo: {},
      videoContext: '',
      movieName: '',
      urlList: [], // 播放列表
      resource: [], // 百度云链接列表
      downList: [], // 下载列表
      currentUrl: '',
      // 是否观看了激励广告
      isLookVideoAd: false,
      // 是否分享了
      isShare: false,
      // 无广告
      isNoAd: false,
      videoAd: null,
      timer: null
    }
  },
  computed: {
    ...mapState(['userInfo', 'config', 'userPower', 'shareImgUrl'])
  },
  onReachBottom() {
    // console.log('滑动到页面底部')
    // if (!this.nextPageUrl) {
    // 	this.loadMoreText = '已经到底啦'
    // 	return;
    // }
    // this.getData()
  },

  methods: {
    // 视频缓冲中
    videoWaiting() {
      console.log('视频缓冲中')
    },
    videoError(err) {
      console.log(err)
      this.videoContext.stop()
      uni.showToast({
        title: `抱歉，视频加载失败，请切换手机网络或尝试其它播放源！`,
        icon: 'none',
      })
    },
    onPlay() {
      return
      if (this.isNoAd) { // 无广告
        return
      }
      if (this.config && this.config.isVIP) { // vip 无广告
        return
      }
      clearTimeout(this.timer)
      if (this.config && this.config.showShare) {
        if (!this.isShare) {
          this.timer = setTimeout(() => {
            this.videoContext.pause()
            this.$refs.sharePopup.open()
          }, 3000)
        }
      } else if (this.config && this.config.showAd) {
        if (!this.isLookVideoAd) {
          this.timer = setTimeout(() => {
            this.videoContext.pause()
            this.$refs.beforeLookAdkPopup.open()
            // uni.showModal({
            // 	title: '提示',
            // 	content: `观看视频广告（约15秒），即可观看完整视频`,
            // 	success: (res) => {
            // 		if (res.confirm) {
            // 			common.showVideoAd(this.videoAd)
            // 		} else if (res.cancel) {
            // 		}
            // 	}
            // })
          }, 3000)
        }
      }
    },
    showImg() {
      if (this.config && this.config.killAdImg) {
        uni.previewImage({
          urls: [this.config.killAdImg]
        })
      } else {
        uni.showToast({
          title: `抱歉，暂无法去除广告！`,
          icon: 'none',
        })
      }
    },
    confirmLookAd() {
      common.showVideoAd(this.videoAd)
    },
    async changeRadio(val) {
      this.currentUrl = val
      await this.$nextTick()
      this.videoContext.play()
    },
    async getData() {
      let data = this.videoInfo
      if (data && data.videoName) {
        this.urlList = data.urlList || []
        if (this.urlList && this.urlList.length) {
          this.currentUrl = this.urlList[0].value
        }
        this.downList = data.downList || []
        this.resource = data.resource || []
      } else {
        uni.showToast({
          title: `抱歉，暂无信息!,请点击左上角返回重新搜索`,
          icon: 'none',
        })
      }
    },
    copy1(item) {
      item = item.target.dataset.item
      let text = `${item.url}`
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
    copy2(item) {
      item = item.target.dataset.item
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
    copy3(item) {
      item = item.target.dataset.item
      let text = item.value
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
    changeCopy(text) {
      this.currentUrl = text
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
    addVideoAd() {
      // 在页面onLoad回调事件中创建激励视频广告实例
      if (wx.createRewardedVideoAd && this.config && this.config.showAd) {
        this.videoAd = wx.createRewardedVideoAd({
          adUnitId: 'adunit-026934ef3981fcdd'
        })
        this.videoAd.onLoad(() => {
        })
        this.videoAd.onError((err) => {
          console.log('videoAd.onError', err)
        })
        this.videoAd.onClose((res) => {
          // 用户点击了【关闭广告】按钮
          if (res && res.isEnded) {
            // 正常播放结束，可以下发游戏奖励
            this.isLookVideoAd = true
            this.videoContext.play()
          } else {
            // 播放中途退出，不下发游戏奖励
          }
        })
      }
    }
  },
  // 加了这个页面才可以被分享
  onShareAppMessage() {
    this.isShare = true
    this.$refs.sharePopup.close()
    return {
      title: '全网电影搜索工具',
      path: '/pages/video-search/video-search',
      imageUrl: '/static/img/pre-video.png'
    }
  },
  async onLoad(e) {
    this.isNoAd = e.isNoAd === '1'
    try {
      this.videoInfo = JSON.parse(wx.getStorageSync('videoInfo'))
    } catch (e) {
      this.videoInfo = {}
    }
    this.movieName = this.videoInfo.videoName || ''
    this.getData()
    uni.setNavigationBarTitle({
      title: this.videoInfo.videoName || '电影详情'
    });
    this.videoContext = wx.createVideoContext('myVideo')
    // 挂载视频广告
    this.addVideoAd()
  },
}
</script>

<style scoped lang="stylus">
@import "../../uni.styl"
.new-page
  display block
  width 100%
  color #333

.video-wrap
  display block

.video-box
  display block

  .video
    width 100%
    height calc(100vw * 0.75)

.source-box
  display block
  border-radius 10px
  background-color $uni-list-item-color
  padding 10px
  margin 5px

.line-title
  display flex
  align-items baseline
  .tip
    font-size 10px
    margin-left 10px
    color $uni-text-color-grey


.play-line-box
  display flex
  flex-wrap nowrap
  overflow auto
  margin-top 5px

  .item
    flex-shrink 1
    white-space nowrap
    background #fff
    color $uni-text-color-grey
    margin-right 5px
    border-radius 3px
    padding 2px 5px

    &.active
      background-color $uni-color-success
      color #fff


.des-box
  display block
  border-radius 10px
  background-color $uni-list-item-color
  padding 10px
  margin 5px

  .content
    font-size 12px

.down-box
  display block
  border-radius 10px
  background-color $uni-list-item-color
  padding 10px
  margin 5px

  .content
    display block
    font-size 12px

    .item
      display block
      word-break break-all

.item-title
  margin-bottom 5px

.share-box
  background-color #fff
  display flex
  flex-direction column

  .text-tip
    flex 1
    padding 20px
    text-align center
    display block
    color $uni-color-error

  .share
    margin 10px
    color $uni-color-success

.popup-center-warp {
  display block
  .top {
    display block
    padding: 20px;
    text-align: center;
  }
  .title {
    color $uni-color-warning
    font-size: 20px;
    font-weight: bold;
    line-height: 45px;
    display block
    text-align center
  }
  .content{
    padding: 20px 0;
  }
  border-radius: 10px;
  background-color: $uni-bg-color2
  width: calc(70vw);
  .bottom-btn {
    display flex
    border-top: 1px solid $uni-border-color2
  }
  .btn-item {
    border: none;
    border-right 1px solid $uni-border-color2
    flex 1
    display: block;
    background-color: transparent;
    border-radius: 0;
    box-sizing: border-box;
    align-items: center;
    overflow: hidden;
    font-size 14px;
    color: $uni-text-color;
    &:after {
      border:none
    }
    &:last-child{
      border-right none
    }
    &.confirm {
      color $uni-color-success
    }
  }
}
</style>
