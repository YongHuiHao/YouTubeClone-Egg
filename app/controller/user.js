'use strict'

const { Controller } = require('egg')

class UserController extends Controller {
  async create() {
    const { ctx, service } = this
    const { body } = ctx.request

    // 校验数据
    ctx.validate({
      username: { type: 'string' },
      password: { type: 'string' },
      email: { type: 'email' }
    })

    // 如果用户存在
    if (await service.user.findByUsername(body.username)) {
      this.ctx.throw(422, '用户名已存在')
    }

    // 如果邮箱存在
    if (await await service.user.findByEmail(body.email)) {
      this.ctx.throw(422, '邮箱已存在')
    }

    // 存储数据
    const user = await service.user.createUser(body)

    // 生成token
    const token = service.user.createToken({
      userId: user._id
    })

    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
        token
      }
    }
  }

  async login() {
    const { ctx, service } = this
    const { body } = ctx.request

    // 校验数据
    ctx.validate({
      password: { type: 'string' },
      email: { type: 'email' }
    })

    // 判断用户是否存在
    const user = await this.service.user.findByEmail(body.email)

    if (!user) {
      ctx.throw(422, '用户不存在')
    }

    // 校验密码
    if (user.password !== this.ctx.helper.md5(body.password)) {
      ctx.throw(422, '密码不正确')
    }

    // 生成token
    const token = service.user.createToken({
      userId: user._id
    })

    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
        token
      }
    }
  }

  async getCurrentUser() {
    const { ctx } = this

    ctx.body = {
      user: {
        email: ctx.user.email,
        username: ctx.user.username,
        channelDescription: ctx.user.channelDescription,
        avatar: ctx.user.avatar
      }
    }
  }

  async update() {
    const { ctx, service } = this
    const { body } = ctx.request

    // 校验基本数据
    ctx.validate({
      email: { type: 'email', required: false },
      username: { type: 'string', required: false },
      password: { type: 'string', required: false },
      channelDescription: { type: 'string', required: false },
      avatar: { type: 'string', required: false }
    })

    if (body.email) {
      // 邮箱是否重复
      if (ctx.user.email !== body.email && (await service.user.findByEmail(body.email))) {
        ctx.throw(422, '邮箱已存在')
      }
    }

    if (body.username) {
      // 用户名是否重复
      if (ctx.user.username !== body.username && (await service.user.findByUsername(body.username))) {
        ctx.throw(422, '用户名已存在')
      }
    }

    // 更新用户
    const user = await service.user.updateUser(ctx.user._id, body)

    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  async subscribe() {
    const userId = this.ctx.user._id
    const channelId = this.ctx.params.userId

    // 1. 用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '用户不能订阅自己')
    }
    // 2. 添加订阅
    const user = await this.service.user.subscribe(userId, channelId)

    // 3. 发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed: true
      }
    }
  }

  async unsubscribe() {
    const userId = this.ctx.user._id
    const channelId = this.ctx.params.userId

    // 1. 用户不能取消订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '用户不能取消订阅自己')
    }

    // 2. 取消订阅
    const user = await this.service.user.unsubscribe(userId, channelId)

    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed: false
      }
    }
  }

  async getUser() {
    let isSubscribed = false
    // 判断是否登陆
    if (this.ctx.user) {
      // 判断是否订阅
      const record = this.app.model.Subscription.findOne({
        channel: this.ctx.params.userId,
        user: this.ctx.user._id
      })
      if (record) {
        isSubscribed = true
      }
    }

    const user = await this.service.user.findById(this.ctx.params.userId)

    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed
      }
    }
  }

  async getSubscriptions() {
    // 查询当前用户订阅的所有频道
    const { userId } = this.ctx.params

    let subscriptions = await this.app.model.Subscription.find({ user: userId }).populate('channel')

    subscriptions = subscriptions.map((item) => {
      return this.ctx.helper._.pick(item.channel, ['_id', 'username', 'avatar'])
    })

    this.ctx.body = {
      subscriptions
    }
  }
}

module.exports = UserController
