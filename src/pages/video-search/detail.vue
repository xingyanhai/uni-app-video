<template>
	<view class="new-page">
		<view class="video-box" v-if="config && config.showVideo">
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
		<view class="source-box" v-if="urlList && urlList.length && config && config.showVideo">
			<view>播放线路</view>
			<view>
				<radio-group class="radio-box" @change="changeRadio">
					<label class="radio" v-for="(item, index) in urlList" :key="index">
						<radio color="#5ba757" :value="item.value" :checked="item.value === currentUrl"/>{{item.name}}
					</label>
				</radio-group>
			</view>
		</view>
		<view class="down-box" v-if="downList.length || resource.length">
			<view class="item-title">下载来源</view>
			<view class="content">
				<view v-for="(value, index) in downList" class="item" :data-item="value" @click="copy1" :key="index">
					{{value.name}} {{value.url}}
				</view>
				<view v-for="(value, index) in resource" class="item" :data-item="value" @click="copy2" :key="index">
					{{value.text}} {{value.src}}
				</view>
			</view>
		</view>
		<view class="des-box" v-if="videoInfo && videoInfo.decs">
			<view class="item-title">剧情简介</view>
			<view class="content">
				{{videoInfo && videoInfo.decs}}
			</view>
		</view>
		<ad v-if="config && config.showAd" ad-theme="black" unit-id="adunit-00961fd55c07dbee" ad-type="video"></ad>
		<uni-popup ref="sharePopup" type="bottom">
			<view class="share-box">
				<view class="text-tip">
					分享给好友，即可观看完整视频。
				</view>
				<button class="share" open-type="share">一键分享</button>
			</view>
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
		components:{uniPopup},
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
				videoAd: null,
				timer: null
			}
		},
		computed: {
			...mapState(['userInfo','config', 'userPower', 'shareImgUrl'])
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
			videoWaiting () {
				console.log('视频缓冲中')
			},
			videoError (err) {
				console.log(err)
				this.videoContext.stop()
				uni.showToast({
					title: `抱歉，视频加载失败，请切换手机网络或尝试其它播放源！`,
					icon: 'none',
				})
			},
			onPlay () {
				clearTimeout(this.timer)
				if (!this.isLookVideoAd && this.config && this.config.showAd) {
					this.timer = setTimeout(() => {
						this.videoContext.pause()
						uni.showModal({
							title: '提示',
							content: `观看视频广告（约15秒），即可观看完整视频`,
							success: (res) => {
								if (res.confirm) {
									common.showVideoAd(this.videoAd)
								} else if (res.cancel) {
								}
							}
						})
					}, 3000)
				} else if (!this.isShare && this.config && this.config.showShare) {
					this.timer = setTimeout(() => {
						this.videoContext.pause()
						this.$refs.sharePopup.open()
					}, 3000)
				}
			},
			async changeRadio (e) {
				this.currentUrl = e.detail.value
				await this.$nextTick()
				this.videoContext.play()
			},
			async getData() {
				let data = this.videoInfo
				if(data && data.videoName) {
					this.urlList = data.urlList || []
					if(this.urlList && this.urlList.length) {
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
			copy1 (item) {
				console.log(item)
				item = item.target.dataset.item
				let text = `${item.name}\n${item.url}`
				wx.setClipboardData({
					data: text,
					success (res) {
						wx.getClipboardData({
							success (res) {
								console.log(res.data) // data
							}
						})
					}
				})
			},
			copy2 (item) {
				item = item.target.dataset.item
				let text = `${item.src}\n${item.text}`
				wx.setClipboardData({
					data: text,
					success (res) {
						wx.getClipboardData({
							success (res) {
								console.log(res.data) // data
							}
						})
					}
				})
			},
			addVideoAd () {
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
		onShareAppMessage () {
			this.isShare = true
			this.$refs.sharePopup.close()
			return {
				title: '全网电影搜索工具',
				path: '/pages/video-search/video-search',
				imageUrl: '/static/img/pre-video.png'
			}
		},
		async onLoad() {
			try {
				this.videoInfo = JSON.parse(wx.getStorageSync('videoInfo'))
			}catch (e) {
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
	.radio-box
		display block
		width 100%
		.radio
			border-bottom 1px solid $uni-border-color
			display block
			line-height 50px
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
</style>
