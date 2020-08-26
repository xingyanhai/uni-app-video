<template>
	<view class="new-page" v-if="config && config.showVideo">
		<view class="video-box">
			<video @waiting="videoWaiting"
				   id="myVideo"
				   class="video"
				   :show-casting-button="true"
				   @error="videoError"
				   :title="movieName"
				   :enable-play-gesture="true"
				   picture-in-picture-mode="pop"
				   autoplay
				   controls
				   :src="currentUrl">
			</video>
		</view>
		<view class="source-box" v-if="urlList && urlList.length">
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
	</view>
</template>

<script>
	import * as api from '../../api/api'
	import * as util from '../../common/util'
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				videoInfo: {},
				videoContext: '',
				movieName: '',
				urlList: [], // 播放列表
				resource: [], // 百度云链接列表
				downList: [], // 下载列表
				currentUrl: ''
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
					title: `抱歉，视频加载失败，尝试其它播放源！`,
					icon: 'none',
				})
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
						title: `抱歉，暂无视频播放源!`,
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
		},
		// 加了这个页面才可以被分享
		onShareAppMessage () {
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
</style>
