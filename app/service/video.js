const Service = require('egg').Service

class VideoService extends Service {
  async getPlayInfo(VideoId) {
    const playInfo = await this.app.vodClient.request('GetPlayInfo', { VideoId }, {})
    if (playInfo) {
      return playInfo.PlayInfoList.PlayInfo[0].PlayURL
    }
  }

  // 获取视频分页处理
  async getVideosPageHandler(condition = {}) {
    const { Video } = this.app.model
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number(pageNum)
    pageSize = Number(pageSize)

    const getVideos = Video.find(condition)
      .populate('user')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
    const getVideosCount = Video.countDocuments(condition)
    const [videos, videosCount] = await Promise.all([getVideos, getVideosCount])

    return { videos, videosCount }
  }
}

module.exports = VideoService
