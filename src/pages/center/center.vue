<template>
	<view class="center">
		<!--<view class="logo" @click="goLogin" :hover-class="!userInfo.isLogin ? 'logo-hover' : ''">-->
			<!--<image class="logo-img" :src="userInfo.avatarUrl ? userInfo.avatarUrl :avatarUrl"></image>-->
			<!--<view class="logo-title">-->
				<!--<text class="uer-name">Hi，{{userInfo.nickName ? userInfo.nickName : '您未登录'}}</text>-->
				<!--<text class="go-login navigat-arrow" v-if="!userInfo.isLogin">&#xe65e;</text>-->
			<!--</view>-->
		<!--</view>-->
		<view class="logo" :hover-class="!userInfo.isLogin ? 'logo-hover' : ''">
			<button class="get-user-button" @getuserinfo="getUserInfoClick" open-type="getUserInfo">
				<image class="logo-img" mode="widthFix" :src="userInfo.avatarUrl ? userInfo.avatarUrl :avatarUrl"></image>
				<view class="logo-title">
					<view class="uer-name">
            <text class="text">
              <template v-if="userInfo.nickName">
                {{userInfo.nickName}}
              </template>
              <template v-else>
                点击授权用户信息
              </template>
            </text>
            <text :class="'level '+ 'level-'+userPower">
              {{userPowerName}}
            </text>
					</view>
				</view>
			</button>
		</view>
		<view class="center-list">
			<view class="center-list-item border-bottom" @click="goAbout">
				<text class="list-icon">&#xe603;</text>
				<text class="list-text">{{(config && config.notice && config.notice.entryName) || '关于'}}</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
            <view class="center-list-item border-bottom">
                <text class="list-icon">&#xe62d;</text>
                <view class="list-text">
					<button class="share common-open-type-button" open-type="share">分享好友</button>
				</view>
                <text class="navigat-arrow">&#xe65e;</text>
            </view>
			<view class="center-list-item border-bottom">
                <text class="list-icon">&#xe609;</text>
                <view class="list-text">
					<button class="share common-open-type-button" open-type="feedback">反馈建议</button>
				</view>
                <text class="navigat-arrow">&#xe65e;</text>
            </view>
			<view class="center-list-item" @click="toPage('/pages/admin/page-to-QR')" v-if="userPower === -1">
				<text class="list-icon">&#xe609;</text>
				<text class="list-text">获取二维码</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
			<view class="center-list-item" @click="toOtherMiniProgram(value)"  v-for="(value, index) in shareList" :key="index">
				<text class="xyh-icon list-icon">&#xe61f;</text>
				<text class="list-text">{{value.shareText || '更多'}}</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
			<ad v-if="config && config.showAd" ad-theme="black" unit-id="adunit-ba0482f09826a14d" ad-type="grid" grid-opacity="0.8" grid-count="5"></ad>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				avatarUrl: '/static/img/logo.png',
			}
		},
		computed: {
			...mapState(['userInfo','config', 'userPower', 'shareImgUrl', 'userPowerName']),
			shareList () {
				let arr = []
				if(this.config && this.config.shareMiniProgramList) {
					return  this.config.shareMiniProgramList
				}
				return arr
			}
		},
		methods: {
			...mapMutations(['getUserInfo','setStateData']),
      getUserInfoClick (e) {
          if(this.userInfo && this.userInfo.isLogin) {
            return
          }
              e.detail.userInfo.isLogin = true
              wx.cloud.init()                              //调用前需先调用init
              wx.cloud.callFunction({
                name: 'addDataToCould',
                data: {
                  dbName: 'userList',
                  primaryKey: 'openId',
                  list: [e.detail.userInfo]
                }
              }).then(async res => {
                await this.getUserInfo()
                uni.showToast(
                  {
                    title: `获取信息成功!`,
                    icon: 'none',
                  }
                );
              })
            },
			goLogin() {
				if (!this.userInfo.isLogin) {
					uni.navigateTo({
						url: '/pages/login/login'
					});
				}
			},
			goAbout() {
				uni.navigateTo({
					url: '/pages/about/about'
				});
			},
			toImgOcr() {
				uni.navigateTo({
					url: '/pages/img-ocr/img-ocr'
				});
			},
			goTest () {
				uni.navigateTo({
					url: '/pages/test/test'
				});
			},
			toPage (url) {
				uni.navigateTo({
					url
				});
			},
			// s是
			goUploadImg () {
				uni.navigateTo({
					url: '/pages/image-upload/image-upload'
				});
			},
			toOtherMiniProgram (item) {
				wx.navigateToMiniProgram({
					appId: item.appId,
					success(res) {
						// 打开成功1
					}
				})
			},
			showInterstitialAd () {
				// 在页面中定义插屏广告
				let interstitialAd = null
				// 在页面onLoad回调事件中创建插屏广告实例
				if (wx.createInterstitialAd && this.config && this.config.showAd) {
					interstitialAd = wx.createInterstitialAd({
						adUnitId: 'adunit-c66450279ba3046d'
					})
					interstitialAd.onLoad(() => {})
					interstitialAd.onError((err) => {})
					interstitialAd.onClose(() => {})
					interstitialAd.show()
				}
			}
		},
      // async onPullDownRefresh() {
      //   await this.$store.commit('getConfig')
		// await this.$store.commit('getUserPower')
		//   console.log(this.userPower,'userPower')
      //   uni.stopPullDownRefresh();
      // },
       // 加了这个页面才可以被分享
		onShareAppMessage: function (res) {
		},
		onLoad() {
      this.getUserInfo()
      setTimeout(() => {
        this.showInterstitialAd()
      }, 3000)
      console.log(this.userPower)
		}
	}
</script>

<style lang="stylus" scoped>
	@import "../../uni.styl"
	.center {
		flex-direction: column;
		min-height: 100vh;
	}
	.logo {
		padding-top 50px
		margin-bottom 20px
		display: block;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
		.get-user-button {
			display: flex;
			width: 100%;
			height: 100%;
			background-color: transparent;
			border: none;
			padding: 20px 0 0;
			margin: 0;
			border-radius: 0;
			justify-content: start;
			align-items center
			box-sizing: border-box;
			overflow: hidden;
			margin-top: -1px;
		}
		.logo-img {
			width: 75px;
			height: 75px;
			border: 2px solid #fff;
			margin 0 20px
		}
		.logo-title {
			display: block;
			text-align: center;
			color: #fff;
			.uer-name {
				font-size: 16px;
				line-height: 40px;
        align-items center
        .level {
          font-size 12px
          line-height 16px
          padding 0 2px
          border-radius 2px
          margin-left 2px
          background-color #fff
          color #000
        }
        .level-2,.level--1{
          color: $uni-vip-color
          background-color $uni-vip-bg
        }
			}
			.phone-number {
				font-size: 14px;
			}
		}
	}

	.logo-hover {
		opacity: 0.8;
	}

	.center-list {
		background-color: $uni-list-item-color;
		margin-top: 20upx;
		width: 750upx;
		flex-direction: column;
	}

	.center-list-item {
		height: 90upx;
		width: 750upx;
		box-sizing: border-box;
		flex-direction: row;
		padding: 0upx 20upx;
	}

	.border-bottom {
		border-bottom-width: 0.5px;
		border-color: $uni-border-color;
		border-bottom-style: solid;
	}

	.list-icon {
		width: 40upx;
		height: 90upx;
		line-height: 90upx;
		font-size: 34upx;
		color: $uni-text-color;
		text-align: center;
		font-family: texticons;
		margin-right: 20upx;
	}

	.list-text {
		height: 90upx;
		line-height: 90upx;
		font-size: 14px;
		color: $uni-text-color;
		flex: 1;
		text-align: left;
	}

	.navigat-arrow {
		height: 90upx;
		width: 40upx;
		line-height: 90upx;
		font-size: 34upx;
		color: #555;
		text-align: right;
		font-family: texticons;
	}
	.share {
		font-size 14px
		line-height: 90upx
		width 100%
	}
</style>
