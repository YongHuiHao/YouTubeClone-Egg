module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const SubcriptionSchema = new Schema({
    // 订阅用户
    user: {
      type: mongoose.ObjectId,
      required: true,
      ref: 'User'
    },
    // 订阅频道
    channel: {
      type: mongoose.ObjectId,
      required: true,
      ref: 'User'
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

  return mongoose.model('Subscription', SubcriptionSchema)
}
