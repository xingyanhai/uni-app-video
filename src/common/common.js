export async function showVideoAd(videoAd) {
    return new Promise((async (resolve, reject) => {
        if (videoAd) {
            let res
            try {
                res = await videoAd.show()
                resolve(true)
            } catch (err) {
                console.log(err)
                try {
                    await videoAd.load()
                    await videoAd.show()
                    resolve(true)
                } catch (e) {
                    console.log('激励视频 广告显示失败1')
                    resolve(false)
                }
            }
        }

    }))
}