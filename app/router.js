'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app
  const auth = app.middleware.auth()

  // 设置基础路径
  router.prefix('/api/v1')

  router.post('/home', controller.home.index)

  // 注册用户
  router.post('/users', controller.user.create)

  // 登陆
  router.post('/login', controller.user.login)

  // 获取当前登陆用户
  router.get('/user', auth, controller.user.getCurrentUser)

  // 更新用户信息
  router.patch('/user', auth, controller.user.update)

  // 订阅频道
  router.post('/users/:userId/subscribe', auth, controller.user.subscribe)

  // 取消订阅
  router.delete('/users/:userId/subscribe', auth, controller.user.unsubscribe)

  // 获取用户（频道）
  router.get('/users/:userId', app.middleware.auth({ required: false }), controller.user.getUser)

  // 获取用户订阅频道
  router.get('/users/:userId/subscriptions', controller.user.getSubscriptions)

  // 获取上传凭证
  router.get('/vod/createUploadVideo', auth, controller.vod.createUploadVideo)

  // 刷新上传凭证
  router.get('/vod/refreshUploadVideo', auth, controller.vod.refreshUploadVideo)

  // 创建视频
  router.post('/videos', auth, controller.videos.createVideo)

  // 获取视频详情
  router.get('/videos/:videoId', app.middleware.auth({ required: false }), controller.videos.getVideo)

  // 获取视频列表
  router.get('/videos', controller.videos.getVideos)

  // 获取用户发布的视频列表
  router.get('/users/:userId/videos', controller.videos.getUserVideos)

  // 获取用户关注频道的视频列表
  router.get('/user/videos/feed', auth, controller.videos.getUserFeedVideos)

  // 更新视频
  router.patch('/videos/:videoId', auth, controller.videos.updateVideo)

  // 删除视频
  router.delete('/videos/:videoId', auth, controller.videos.deleteVideo)

  // 添加评论
  router.post('/videos/:videoId/comments', auth, controller.videos.createComment)

  // 获取视频评论列表
  router.get('/videos/:videoId/comments', controller.videos.getVideoComments)

  // 删除视频评论
  router.delete('/videos/:videoId/comments/:commentId', auth, controller.videos.deleteVideoComment)

  // 视频点赞
  router.post('/videos/:videoId/like', auth, controller.videos.likeVideo)

  // 视频点踩
  router.post('/videos/:videoId/dislike', auth, controller.videos.dislikeVideo)

  // 获取用户喜欢的视频列表
  router.get('/user/videos/liked', auth, controller.videos.getUserLikedVideos)
}
