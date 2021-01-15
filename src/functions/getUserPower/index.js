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
const isAdminOpenIds = ['oFQK35N21KRlw2cDmNk7wo6CVctk']

// 云函数入口函数
// -1: 超管，1：其他
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try{
    let openId = wxContext.OPENID || event.openId
    let isAdmin = isAdminOpenIds.includes(openId)
    if(isAdmin) {
      return -1
    } else {
      return 1
    }
  }catch (e) {
    return 0
  }

}
