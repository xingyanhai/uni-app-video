<template>
	<view class="about">
		<view class="content">
			<view class="qrcode">
				<text class="tip">{{notice.title || ''}}</text>
				<view class="content-box">
					<view class="item" v-for="(item, index) in notice.content" :key="index">
						{{item.label || ''}}
					</view>
				</view>
				<text class="time">{{notice.time || ''}}</text>
			</view>
		</view>

	</view>
</template>

<script>
	import {mapState} from "vuex";
	export default {
		data() {
			return {
				providerList: [],
				notice: {},
				version: '',
			}
		},
		computed: mapState(['config']),
		onLoad() {
			this.notice = this.config && this.config.notice
		},
		methods: {
		}
	}
</script>

<style scoped lang="stylus">
	.time
		text-align right
		margin-top 20px
		width 100%
		font-size 10px
	.content-box
		display block
		width 100%
		.item
			display block
			text-align left
			line-height 40px
	.tip
		width 100%
		text-align center
		margin-top: 30px
		margin-bottom 20px
		font-size 18px
	page,
	view {
		display: flex;
	}

	page {
		min-height: 100%;
	}

	image {
		width: 360upx;
		height: 360upx;
	}

	.about {
		flex-direction: column;
		flex: 1;
	}

	.content {
		flex: 1;
		padding: 30upx;
		flex-direction: column;
		justify-content: center;
	}

	.qrcode {
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.qrcode .tip {
		margin-top: 20upx;
	}

	.desc {
		margin-top: 30upx;
		display: block;
	}

	.code {
		color: #e96900;
		background-color: #f8f8f8;
	}

	button {
		width: 100%;
		margin-top: 40upx;
	}

	.version {
		height: 80upx;
		line-height: 80upx;
		justify-content: center;
		color: #ccc;
	}

	.source {
		margin-top: 30upx;
		flex-direction: column;
	}

	.source-list {
		flex-direction: column;
	}

	.link {
		color: #007AFF;
	}
</style>
