<template>
    <view class="wrap">
        <view class="main-top">
            <view class="search-box">
                <SearchBtn placeholder="请输入电影名称搜索" v-model="search" @searchClick="searchClick"></SearchBtn>
                <view class="tips">
                  tips: {{getTips}}
                </view>
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
              <br>
              <br>
<!--              暂无数据-->
            </view>

            <view class="re-search" v-if="sourceNo > 1 && sourceNo !== -1">
                <view class="tip-top-box">
                    没有搜到或搜到的都不是您想要的？<br>
                    可以切换到其它来源再搜一次 <br>
                </view>
                <button type="primary" @click="searchClick(true)">
                    切换至 来源{{sourceNo}} 再次搜索
                </button>
            </view>
        </view>

        <view class="main-bottom">
<!--            <view class="button-add-count">-->
<!--                <view v-if="config && config.showCurrentCount">当前剩余搜索次数:{{currentFreeCount}}</view>-->
<!--                <view class="btn" @click="addCountClick" v-if="config && config.showLookAd">-->
<!--                    点击观看视频广告，获取{{addFreeCount}}次搜索次数-->
<!--                </view>-->
<!--            </view>-->
            <view class="bottom-ad-box" v-if="config && config.showAd">
                <ad-custom ad-theme="black" style="width: 100%!important;" unit-id="adunit-6bb619e3fa5b2d94"></ad-custom>
            </view>
        </view>
    </view>
</template>

<script>
    import SearchBtn from '../components/search-btn'

    import {
        mapState,
        mapMutations
    } from 'vuex'
    import * as common from '../../common/common'

    export default {
        data() {
            return {
                search: '',
                // 搜索源编号 1,2,3... -1:没有了
                sourceNo: 1,
                list: [],
                loading: false,
                videoAd: null,
                searchMap: {},
                currentFreeCount: 0,
                query: {}
            }
        },
        components: {SearchBtn},
        computed: {
            ...mapState(['userInfo', 'config']),
            addFreeCount() {
                return this.config.addFreeCount || 1
            },
            firstFreeCount() {
                return this.config.firstFreeCount || 1
            },
            getTips () {
              let arr = ['电影搜索可能耗时较长，请耐心等待。']
              if (this.config && this.config.tips) {
                arr.push(this.config.tips)
              }
              return arr.map((e, i) => {
                if (arr.length>1) {
                  return `${i + 1}.${e}`
                } else {
                  return e
                }
              }).join(' ')
            },
        },
        watch: {
            config() {
                this.getCurrentFreeCount()
                this.createRewardedVideoAd()
            },
            currentFreeCount() {
                this.setCurrentFreeCount()
            }
        },
        methods: {
            ...mapMutations(['getUserInfo', 'setStateData']),
            getCurrentFreeCount() {
                let count = 0
                try {
                    let num = wx.getStorageSync('currentFreeCount')
                    count = num === '' ? this.firstFreeCount : num
                } catch (e) {
                    count = this.firstFreeCount
                }
                count = Number(count)
                this.currentFreeCount = count
            },
            setCurrentFreeCount() {
                let count = this.currentFreeCount
                wx.setStorageSync('currentFreeCount', count)
            },
            showPlay(data) {
                if (!this.config.showVideo) {
                    return false
                }
                return data.urlList && data.urlList.length > 0
            },
            showDown(data) {
                if (!this.config.showVideo) {
                    return false
                }
                return (data.downList && data.downList.length > 0) || (data.resource && data.resource.length > 0)
            },
            addCountClick() {
                common.showVideoAd(this.videoAd)
            },
            tryToShowAd() {
                let isShowAd = false
                if (this.currentFreeCount <= 0 && this.config && this.config.showAd) {
                    isShowAd = true
                    uni.showModal({
                        title: '提示',
                        content: `观看视频广告（约15秒），即可获取${this.addFreeCount}次搜索机会哦！(无搜索结果不计)`,
                        success: (res) => {
                            if (res.confirm) {
                                common.showVideoAd(this.videoAd)
                                console.log('用户点击确定')
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }
                return isShowAd
            },
            async searchClick(isAgain) {
                // let isShowAd = this.tryToShowAd()
                // if (isShowAd) {
                //     return
                // }
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
                    )
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
                    )
                }
                if (res && res.errMsg === 'cloud.callFunction:ok') {
                    this.list = res.result.list || []
                    this.sourceNo = res.result.nextSourceNo
                    // 记录搜索次数
                    if (this.list.length) {
                        if (this.searchMap[this.search]) {
                            this.searchMap[this.search]++
                        } else {
                            this.searchMap[this.search] = 1
                        }
                        let count = this.currentFreeCount - 1
                        if (count < 0) {
                            count = 0
                        }
                        this.currentFreeCount = count
                    }
                } else { // 可能是超时
                    this.sourceNo++
                    uni.showToast(
                        {
                            title: `请切换来源重试${res.result.msg}`,
                            icon: 'none',
                        }
                    )
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
                try {
                    wx.setStorageSync('videoInfo', JSON.stringify(data))
                } catch (e) {
                }
                let isNoAd = this.query && this.query.isNoAd
                uni.navigateTo({
                    url: `/pages/video-search/detail?isNoAd=${isNoAd}`
                })
            },
            createRewardedVideoAd () {
                // 在页面onLoad回调事件中创建激励视频广告实例
                if (wx.createRewardedVideoAd && this.config && this.config.showAd && !this.videoAd) {
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
                            // 重置搜索次数
                            this.searchMap = {}
                            this.currentFreeCount += this.addFreeCount
                            uni.showModal({
                                title: '提示',
                                showCancel: false,
                                content: `恭喜您,目前剩余${this.currentFreeCount}次搜索机会!`,
                                success: function (res) {
                                    if (res.confirm) {
                                    } else if (res.cancel) {
                                    }
                                }
                            })
                        } else {
                            // 播放中途退出，不下发游戏奖励
                        }
                    })
                }
            }
        },
        // 加了这个页面才可以被分享
        onShareAppMessage: function (res) {
        },
        onHide() {
            this.setCurrentFreeCount()
        },
        onShow() {
            if (this.config && Object.keys(this.config).length) {
                this.getCurrentFreeCount()
                this.createRewardedVideoAd()
            }
        },
        async onLoad(e) {
            this.query = e
            if (e && e.search) {
                this.search = e.search
                this.searchClick()
            }
        }
    }
</script>

<style lang="stylus" scoped>
    @import "../../uni.styl"
    .wrap
        display flex
        width 100%
        flex-direction column

        .main-top
            display block
            width 100%
            flex 1
            overflow hidden

        .main-bottom
            display block
            width 100%

    .search-box
        box-sizing border-box
        display block
        width 100%
        padding 0 10px 10px
        margin-top 10px
        .tips
          display block
          font-size 12px
          margin-top 5px
          color $uni-color-subtitle

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
                    min-height 148px
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

    .tip-top-box
        display block
        padding 5px 0

    .button-add-count
        display flex
        flex-direction column
        justify-content center
        align-items center
        font-size 12px
        line-height 20px

        .btn
            color #00b26a
            line-height 30px

    .bottom-ad-box
        margin-top 10px
        display flex
        justify-content space-around
        align-items center
        width 100%

    .app-tips
        color red
        display block
        text-align center
        font-size 12px
</style>
