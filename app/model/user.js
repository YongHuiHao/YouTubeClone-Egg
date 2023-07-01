module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const UserSchema = new Schema({
    // 用户名
    username: {
      type: String,
      required: true
    },
    // 密码
    password: {
      type: String,
      required: true,
      select: false
    },
    // 邮箱
    email: {
      type: String,
      required: true
    },
    // 头像
    avatar: {
      type: String,
      default: null
    },
    // 封面
    cover: {
      type: String,
      default: null
    },
    // 频道介绍
    channelDescription: {
      type: String,
      default: null
    },
    // 订阅频道数量
    subscribersCount: {
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

  return mongoose.model('User', UserSchema)
}
