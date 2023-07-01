module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const LikeSchema = new Schema({
    // 点赞状态
    like: {
      type: Number,
      enum: [1, -1],
      required: true
    },
    // 点赞用户
    user: {
      type: mongoose.ObjectId,
      required: true,
      ref: 'User'
    },
    // 点赞视频
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

  return mongoose.model('VideoLike', LikeSchema)
}
