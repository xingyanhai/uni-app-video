const env = 'test-xyh-zhitu'
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env
})
const db = cloud.database({
  env
})
// 超管的openId
const adminOpenIds = ['oFQK35N21KRlw2cDmNk7wo6CVctk1']
// vip的openId
const vipOpenIds = [
    'oFQK35N21KRlw2cDmNk7wo6CVctk1'
]

// 云函数入口函数
// -1: 超管，1：一般用户 2：vip
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try{
    let openId = wxContext.OPENID || event.openId
    let isAdmin = adminOpenIds.includes(openId)
    let isVipIds = vipOpenIds.includes(openId)
    if(isAdmin) {
      return -1
    } else if(isVipIds) {
      return 2
    } else {
      return 1
    }
  }catch (e) {
    return 0
  }

}
