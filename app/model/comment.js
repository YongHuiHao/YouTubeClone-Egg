module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const CommentSchema = new Schema({
    // 评论内容
    content: {
      type: String,
      required: true
    },
    // 评论用户
    user: {
      type: mongoose.ObjectId,
      required: true,
      ref: 'User'
    },
    // 评论视频
    video: {
      type: mongoose.ObjectId,
      required: true,
      ref: 'Video'
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

  return mongoose.model('Comment', CommentSchema)
}
