'use strict'

const { Controller } = require('egg')

class VideosController extends Controller {
  async createVideo() {
    const { body } = this.ctx.request
    const { Video } = this.app.model

    this.ctx.validate({
      title: { type: 'string' },
      videoId: { type: 'string' },
      cover: { type: 'string' },
      description: { type: 'string' }
    })
    body.user = this.ctx.user._id
    let video = await new Video(body).save()
    video = await Video.findById(video._id).populate('user')
    // 获取请求参数
    this.ctx.body = {
      video: {
        ...this.ctx.helper._.pick(video, ['videoId', 'title', 'cover', 'description', 'user'])
      }
    }
  }

  async getVideo() {
    const { user } = this.ctx
    const { Video, Like, Subscription } = this.app.model

    let video = await Video.findById(this.ctx.params.videoId).populate('user', '_id username avatar subscribersCount')

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    video = video.toJSON()

    video.playURL = await this.service.video.getPlayInfo(video.videoId)

    video.isLike = false // 是否喜欢
    video.isUnLike = false // 是否不喜欢
    video.user.isSubscribed = false // 是否订阅该作者

    if (user) {
      if (await Like.findOne({ user: user._id, video: video._id, like: 1 })) {
        video.isLike = true
      }
      if (await Like.findOne({ user: user._id, video: video._id, like: -1 })) {
        video.isUnLike = true
      }
      if (await Subscription.findOne({ user: user._id, channel: video.user._id })) {
        video.user.isSubscribed = true
      }
    }

    this.ctx.body = {
      video
    }
  }

  async getVideos() {
    const result = await this.service.video.getVideosPageHandler()
    this.ctx.body = result
  }

  async getUserVideos() {
    const { userId } = this.ctx.params
    const result = await this.service.video.getVideosPageHandler({ user: userId })
    this.ctx.body = result
  }

  async getUserFeedVideos() {
    const { user } = this.ctx
    const { Subscription } = this.app.model

    // 获取到当前用户关注的用户
    const channels = await Subscription.find({ user: user._id }).populate('channel')
    const channelIds = channels.map((item) => item.channel._id)
    const result = await this.service.video.getVideosPageHandler({ user: { $in: channelIds } })

    this.ctx.body = result
  }

  async updateVideo() {
    const { Video } = this.app.model
    const { videoId } = this.ctx.params
    const { body } = this.ctx.request
    const { user } = this.ctx

    this.ctx.validate({
      title: { type: 'string', required: false },
      videoId: { type: 'string', required: false },
      cover: { type: 'string', required: false },
      description: { type: 'string', required: false }
    })

    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    if (!video.user.equals(user._id)) {
      this.ctx.throw(403)
    }

    Object.assign(video, this.ctx.helper._.pick(body, ['title', 'videoId', 'cover', 'description']))

    await video.save()

    this.ctx.body = video
  }

  async deleteVideo() {
    const { Video } = this.app.model
    const { user } = this.ctx
    const { videoId } = this.ctx.params

    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    // 非本人不能删除
    if (!video.user.equals(user._id)) {
      this.ctx.throw(403)
    }

    await video.remove()

    this.ctx.status = 200
  }

  async createComment() {
    const { user } = this.ctx
    const { videoId } = this.ctx.params
    const { content } = this.ctx.request.body
    const { Comment, Video } = this.app.model

    this.ctx.validate({
      content: { type: 'string' }
    })

    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    const comment = await new Comment({ content, user: user._id, video: video._id }).save()

    video.commentsCount = await Comment.countDocuments({ video: videoId })

    await video.save()

    await comment.populate('user').populate('video').execPopulate()

    this.ctx.body = { comment }
  }

  async getVideoComments() {
    const { videoId } = this.ctx.params
    const { Video, Comment } = this.app.model
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number(pageNum)
    pageSize = Number(pageSize)

    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    const getComments = Comment.find({ video: videoId })
      .populate('user')
      .populate('video')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)

    const getCommentsCount = Comment.countDocuments({ video: videoId })
    const [comments, commentsCount] = await Promise.all([getComments, getCommentsCount])

    this.ctx.body = {
      comments,
      commentsCount
    }
  }

  async deleteVideoComment() {
    const { Video, Comment } = this.app.model
    const { videoId, commentId } = this.ctx.params
    const { user } = this.ctx

    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      this.ctx.throw(404, 'Comment Not Found')
    }

    if (!comment.user.equals(user._id)) {
      this.ctx.throw(403)
    }

    await comment.remove()

    video.commentsCount = await Comment.countDocuments({ video: videoId })
    await video.save()

    this.ctx.status = 200
  }

  async likeVideo() {
    const { Video, VideoLike } = this.app.model
    const { videoId } = this.ctx.params
    const { user } = this.ctx

    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    const doc = await VideoLike.findOne({ video: videoId, user: user._id })

    let isLiked = true

    if (doc) {
      if (doc.like === 1) {
        await doc.remove()
        isLiked = false
      }
      if (doc.like === -1) {
        doc.like = 1
        await doc.save()
      }
    } else {
      await new VideoLike({
        like: 1,
        user: user._id,
        video: videoId
      }).save()
    }

    video.likesCount = await VideoLike.countDocuments({ video: videoId, like: 1 })

    video.dislikesCount = await VideoLike.countDocuments({ video: videoId, like: -1 })

    await video.save()

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isLiked
      }
    }
  }

  async dislikeVideo() {
    const { Video, VideoLike } = this.app.model
    const { videoId } = this.ctx.params
    const { user } = this.ctx

    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    const doc = await VideoLike.findOne({ video: videoId, user: user._id })

    let isDisLiked = true

    if (doc) {
      if (doc.like === -1) {
        await doc.remove()
        isDisLiked = false
      }
      if (doc.like === 1) {
        doc.like = -1
        await doc.save()
      }
    } else {
      await new VideoLike({
        like: -1,
        user: user._id,
        video: videoId
      }).save()
    }

    video.likesCount = await VideoLike.countDocuments({ video: videoId, like: 1 })

    video.dislikesCount = await VideoLike.countDocuments({ video: videoId, like: -1 })

    await video.save()

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isDisLiked
      }
    }
  }

  async getUserLikedVideos() {
    const userId = this.ctx.user._id
    const { Video, VideoLike } = this.app.model
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number(pageNum)
    pageSize = Number(pageSize)

    const likes = await VideoLike.find({ user: userId, like: 1 })
      .sort({ createAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)

    const videoIds = likes.map((item) => item.video._id)

    const getVideos = Video.find({ _id: { $in: videoIds } }).populate('user')

    const getVideosCount = VideoLike.countDocuments({ user: userId, like: 1 })

    const [videos, videosCount] = await Promise.all([getVideos, getVideosCount])

    this.ctx.body = {
      videos,
      videosCount
    }
  }
}

module.exports = VideosController
