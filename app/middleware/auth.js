const jwt = require('jsonwebtoken')

module.exports = (options = { required: true }) => {
  return async (ctx, next) => {
    if (ctx.header.authorization) {
      // 获取token
      const token = ctx.header.authorization?.replace('Bearer ', '')
      // 验证token
      const result = jwt.verify(token, ctx.app.config.jwt.secretKey)
      ctx.user = await ctx.model.User.findById(result.userId)
    } else if (options.required) {
      ctx.throw(401)
    }

    await next()
  }
}
