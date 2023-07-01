module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const ViewSchema = new Schema({
    // 观看用户
    user: {
      type: mongoose.ObjectId,
      required: true,
      ref: 'User'
    },
    // 观看视频
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

  return mongoose.model('View', ViewSchema)
}
