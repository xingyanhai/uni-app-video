<template>
	<view class="wrap">
		<view class="search-box">
			<SearchBtn placeholder="请输入电影名称搜索" v-model="search" @searchClick="searchClick"></SearchBtn>
		</view>
		<view class="list" v-if="list && list.length">
			<view class="item" v-for="item in list" :key="item.webUrl">
				<view class="content">
					<image mode="widthFix" class="image" :src="item.coverImg"></image>
					<view class="des">
						<view class="title">{{item.videoName}}</view>
						<view v-if="item.time" class="time">{{item.time}}</view>
					</view>
				</view>
				<view class="res-list">
					<view class="res-list-item" v-for="resItem in item.resource" :key="resItem.src">
						<view @click="copy(resItem)">{{resItem.src}}</view>
						<view @click="copy(resItem)">{{resItem.text}}</view>
					</view>
				</view>
			</view>
		</view>
		<view v-else class="center">
			暂无数据 <br>
			输入电影名称进行搜索 <br>
			电影搜索可能耗时较长，请耐心等待。
		</view>
		<view class="re-search" v-if="sourceNo > 1 && sourceNo !== -1">
			<text>没有搜到内容或搜到的都不是您想要的？可以切换视频来源再来一次</text>
			<button type="primary" @click="searchClick(true)">
				切换来源再搜一次
			</button>
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
				list: []
			};
		},
		components: {SearchBtn},
        computed: mapState(['userInfo']),
		methods: {
			...mapMutations(['getUserInfo','setStateData']),
			async searchClick (isAgain) {
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
				uni.showLoading({
					title: '搜索中...'
				})
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
				} catch (e) {
					uni.hideLoading()
					uni.showToast(
							{
								title: '搜索失败，请修改关键字重试',
								icon: 'none',
							}
					);
				}
				if(res.errMsg === 'cloud.callFunction:ok') {
					this.list = res.result.list
					this.sourceNo = res.result.nextSourceNo
				} else { // 可能是超时
					this.sourceNo ++
					uni.showToast(
							{
								title: `请切换来源重试${res.result.msg}`,
								icon: 'none',
							}
					);
				}
			},
			copy (item) {
				console.log(item)
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
		background-color #fff
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
</style>
