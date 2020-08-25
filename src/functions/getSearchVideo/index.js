const env = 'test-xyh-video'
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env
})
const db = cloud.database({
  env
})
const cheerio = require('cheerio');
const fetch = require('./fetch')
// 获取配置
async function getConfig() {
  let resData = await cloud.callFunction({
    name: 'getDbListData',
    data: {
      dbName: 'config',
      pageNo: 1,
      pageSize: 1,
      limitType: 3
    }
  })
  return resData.result.data[0] || {};
}

function getUUID (n = 32) {
  var str = "abcdefghijklmnopqrstuvwxyz0123456789"; // 可以作为常量放到random外面
  var result = "";
  for(var i = 0; i < n; i++) {
    result += str[parseInt(Math.random() * str.length)];
  }
  return result;
}

// 一杯电影
async function getVideo100 (search) {
  // 打开页面时间
  const startTime = new Date();
  // 渲染URL
  const url = 'http://100.xiaobeidy.com';
  try {
    // 使用request.js库发送get请求
    // const html = await http(url)
    const html = await fetch({
      url,
      params: {
        s: search
      },
      method: 'get',
      timeout: 120000,
    })
    // 载入并初始化cheerio
    const $ = cheerio.load(html)
    // 取出目标节点，即带article-list-link css类的<a>
    const linksDom = $('.excerpt .focus')
    const fetchPages = []
    // // 遍历dom集数组
    linksDom.each((index, item) => {
      fetchPages.push(
          fetch({
            url: $(item).attr('href'),
            method: 'get',
            timeout: 600000,
          })
      )
    })
    console.log(`开始请求${fetchPages.length}个页面`)
    const pageDetailArr = await Promise.all(fetchPages)
    console.log(`请求${pageDetailArr.length}个页面结束`)
    const dataArr = pageDetailArr.map((html, index) => {
      try {
        console.log(`正在爬取第${index + 1}个页面数据`)
        const $ = cheerio.load(html)
        // 取出目标节点，即带article-list-link css类的<a>
        const $mainDom = $($('.content-wrap')[0])
        const webUrl = $mainDom.find('.article-title').find('a').attr('href')
        const title = $mainDom.find('.article-title').text()
        const time = $mainDom.find('.article-meta .item').text().slice(0, 10)
        const imgSrc = $mainDom.find('.article-content img').eq(1).attr('src')
        const resource = []
        $($mainDom.find('.article-content').html().split('<hr>')[1]).find('a').each((index, item) => {
          resource.push({
            src: $(item).attr('href'),
            text: $(item).parent().text()
          })
        });

        return {
          webUrl,
          videoName: title,
          time,
          coverImg: imgSrc,
          resource
        }
      } catch (e) {
        console.log(`爬取第${index + 1}个页面出错`)
        return false
      }
    })
    return dataArr.filter(e => !!e)
  } catch (err) {
    console.log(`page发生错误：${url}`);
  }
  console.log(`页面耗时: ${new Date() - startTime}ms，渲染页URL：${url}`);
}

// 天天在线电影大全
async function getVideo432115(search) {
  const url = 'https://wq.432115.com/app/index.php?i=12&t=0&v=2.0.8&from=wxapp&c=entry&a=wxapp&do=Search&m=sg_movie'
  const res = await fetch({
    url,
    params: {
      sign: getUUID(),
      key: search
    },
    method: 'get',
    timeout: 60000,
  });
  let returnList = []
  if(res && res.data && res.data.length) {
    let dataList = res.data
    dataList.forEach(data => {
      if(data.vod_play_url && data.vod_play_url.length) {
        let urlList = []
        let list = `${data.vod_play_url || ''}`.split(data.vod_play_note)
        urlList = list.map(e => {
          let item = e.split('$')
          return {
            name: item[0],
            value: item[1]
          }
        }).filter(e => !!e.value)
        returnList.push(
            {
              videoName: data.vod_name,
              actor: data.vod_actor,
              videoType: data.vod_class,
              decs: data.vod_content,
              director: data.vod_director,
              coverImg: data.vod_pic,
              urlList
            }
        )
      }
    })
  }
  return returnList
}

// 在线会员热门电影
async function getVideoIyx3(search) {
  const url = 'https://www.iyx3.com/app/index.php?i=2&t=0&v=1.1&from=wxapp&c=entry&a=wxapp&do=Search&m=sg_movie'
  const res = await fetch({
    url,
    params: {
      key: search
    },
    method: 'get',
    timeout: 60000,
  });
  let returnList = []
  if(res && res.data && res.data.length) {
    let dataList = res.data
    dataList.forEach(data => {
      if(data.vod_play_url && data.vod_play_url.length) {
        let urlList = []
        let list
        if(data.vod_play_note) {
          list = `${data.vod_play_url || ''}`.split(data.vod_play_note)
        } else {
          list = [data.vod_play_url]
        }

        urlList = list.map(e => {
          let item = e.split('$')
          return {
            name: item[0],
            value: item[1]
          }
        }).filter(e => !!e.value)
        returnList.push(
            {
              videoName: data.vod_name,
              actor: data.vod_actor,
              videoType: data.vod_class,
              decs: data.vod_content,
              director: data.vod_director,
              coverImg: data.vod_pic,
              urlList
            }
        )
      }
    })
  }
  return returnList
}

// 知也电影1100..88
async function getVideoZy (search) {
  const url = 'https://www.zydy365.com/mini/cms/public/index.php?service=App.Mini.searchVod'
  let res = await fetch({
    url,
    params: {
      key: search
    },
    method: 'get',
    timeout: 60000,
  });
  let returnList = []
  res = eval(`(${res})`)
  if(res && res.Data && res.Data.length) {
    let searchList = res.Data
    let fetchList = []
    searchList.forEach(e => {
      const url = 'https://www.zydy365.com/mini/cms/public/index.php?service=App.Mini.getOnlineMvByIdZHIYE2'
      let f = fetch({
        url,
        params: {
          vodid: e.vod_id
        },
        method: 'get',
        timeout: 60000,
      });
      fetchList.push(f)
    })
    let dataList = [];
    let detailRes = await Promise.all(fetchList)
    detailRes.forEach(e => {
      e =  eval(`(${e})`)
      if(e.Code === 200) {
        dataList.push(e.Data)
      }
    })
    dataList.forEach(data => {
      if(data.videos && data.videos.length) {
        // 播放列表11
        let urlList = []
        data.videos.forEach(itemList => {
          if(itemList && itemList.length) {
            itemList.forEach(item => {
              urlList.push(
                {
                  name: item.play_name,
                  value: item.play_url
                }
              )
            })
          }
        })
        urlList = urlList.filter(e => !!e.value)
        // 下载列表
        let downList = undefined
        if (data.downs && data.downs.length) {
          downList = data.downs.map(e => {
            return {
              name: e.down_name,
              url: e.down_url
            }
          })
        }
        returnList.push(
            {
              videoName: data.vod_name,
              actor: data.vod_actor,
              videoType: data.vod_class,
              decs: data.vod_content,
              director: data.vod_director,
              coverImg: data.vod_pic,
              urlList,
              downList
            }
        )
      }
    })
  }
  return returnList
}

// 云函数入口函数
exports.main = async (event, context) => {
  let {search, sourceNo = 1} = event;
  try {
    const wxContext = cloud.getWXContext(search)
    let returnList = [];
    let nextSourceNo;
    if (sourceNo === 1) { // 来源
      // 知也电影
      returnList = await getVideoZy(search)
      nextSourceNo = 2
    } else if(sourceNo === 2) {
      // 天天在线电影大全
      returnList = await getVideo432115(search)
      nextSourceNo = 3
    } else if (sourceNo === 3) {
      // 一杯电影
      returnList = await getVideo100(search)
      nextSourceNo = 4
    } else if (sourceNo === 4) {
      // 在线会员热门电影
      returnList = await getVideoIyx3(search)
      nextSourceNo = -1
    } else {
      nextSourceNo = 1
    }

    return {
      list: returnList,
      nextSourceNo
    }
  }catch (e) {
    console.log(e)
    let nextSourceNo = sourceNo ++;
    if (nextSourceNo > 4) {
      nextSourceNo = -1
    }
    return {
      list: [],
      nextSourceNo
    }
  }
}
