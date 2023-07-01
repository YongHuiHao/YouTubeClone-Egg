module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const VideoSchema = new Schema({
    // 创建人
    user: {
      type: mongoose.ObjectId,
      required: true,
      ref: 'User'
    },
    // 视频标题
    title: {
      type: String,
      required: true
    },
    // 视频id
    videoId: {
      type: String,
      required: true
    },
    // 视频描述
    description: {
      type: String,
      required: true
    },
    // 视频封面
    cover: {
      type: String,
      required: true
    },
    likesCount: {
      type: Number,
      default: 0
    },
    dislikesCount: {
      type: Number,
      default: 0
    },
    // 评论数量
    commentsCount: {
      type: Number,
      default: 0
    },
    // 创建时间
    createdAt: {
      type: Date,
      default: Date.now
    },
    // 更新时间
    updatedAt: {
      type: Date,
      default: Date.now
    }
  })

  return mongoose.model('Video', VideoSchema)
}
