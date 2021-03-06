import Vue from 'vue'
import Vuex from 'vuex'
import * as api from '../api/api'
Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		primaryColor: '#fb7349',
		/**
		 * 是否需要强制登录
		 */
		forcedLogin: true,
		hasLogin: false,
		userInfo: {},
		config: {},
		tagList: [],
		shareImgUrl: '',
		userPower: 0, // -1：超管 1：普通用户 2：vip
		userPowerName: '普通用户'
	},
	mutations: {
		async getUserInfo(state) {
			let userInfoData = await wx.cloud.callFunction({
				name: 'getDbListData',
				data: {
					dbName: 'userList',
					pageNo: 1,
					pageSize: 1,
					limitType: 1
				}
			})
			state.userInfo = userInfoData.result.data[0] || {};
		},
		async getConfig(state) {
			let resData = await wx.cloud.callFunction({
				name: 'getDbListData',
				data: {
					dbName: 'config',
					pageNo: 1,
					pageSize: 1,
					limitType: 3
				}
			})
			state.config = resData.result.data[0] || {};
		},
		async getUserPower(state) {
			let resData = await wx.cloud.callFunction({
				name: 'getUserPower',
				data: {}
			})
			state.userPower = resData.result
			let userMap = {
				0: '',
				'-1':'admin',
				1: '普通用户',
				2: 'VIP'
			}
			state.userPowerName = userMap[resData.result]
		},
		setStateData (state, obj = {}) {
			Object.keys(obj).forEach(key => {
				state[key] = obj[key]
			})
		}
	}
})

export default store
