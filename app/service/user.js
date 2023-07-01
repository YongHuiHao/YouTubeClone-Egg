const Service = require('egg').Service
const jwt = require('jsonwebtoken')

class UserService extends Service {
  get User() {
    return this.app.model.User
  }

  get Subscription() {
    return this.app.model.Subscription
  }

  findByUsername(username) {
    return this.User.findOne({ username })
  }

  findByEmail(email) {
    return this.User.findOne({ email }).select('+password')
  }

  findById(userId) {
    return this.User.findById(userId)
  }

  async createUser(data) {
    // 密码加密
    data.password = this.ctx.helper.md5(data.password)
    const user = new this.User(data)
    await user.save()
    return user
  }

  async updateUser(userId, data) {
    return this.User.findByIdAndUpdate(userId, data, {
      new: true // 返回更新后的数据
    })
  }

  createToken(data) {
    return jwt.sign(data, this.config.jwt.secretKey, {
      expiresIn: this.config.jwt.expiresIn
    })
  }

  verifyToken(token) {
    return jwt.verify(token, this.config.jwt.secretKey)
  }

  async subscribe(userId, channelId) {
    const record = await this.Subscription.findOne({
      user: userId,
      channel: channelId
    })
    const user = await this.User.findById(channelId)

    // 如果没有订阅过才能继续
    if (!record) {
      await new this.Subscription({
        user: userId,
        channel: channelId
      }).save()
      user.subscribersCount++
      await user.save()
    }

    return user
  }

  async unsubscribe(userId, channelId) {
    const { Subscription, ctx } = this
    const user = await this.findById(channelId)
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId
    })

    if (record) {
      // 删除订阅数据
      await record.remove()
      // 订阅数量减一
      user.subscribersCount--
      await user.save()
    }

    return user
  }
}

module.exports = UserService
